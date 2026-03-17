import express from 'express';
import { query, getPool } from '../database/connection.js';

const router = express.Router();

// Middleware: require auth
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
};

router.use(requireAuth);

// POST / - Place order with transaction handling
router.post('/', async (req, res) => {
    const { collection_slot_id, fulfilment_type, delivery_address_line1, delivery_address_line2, delivery_city, delivery_postcode } = req.body;

    if (!fulfilment_type || !['collection', 'delivery'].includes(fulfilment_type)) {
        return res.status(400).json({ error: 'Invalid fulfilment_type' });
    }

    if (fulfilment_type === 'collection' && !collection_slot_id) {
        return res.status(400).json({ error: 'collection_slot_id required for collection' });
    }

    if (fulfilment_type === 'delivery' && (!delivery_address_line1 || !delivery_city || !delivery_postcode)) {
        return res.status(400).json({ error: 'Delivery address required' });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
        await connection.beginTransaction();

        // Get cart items
        const cartItems = await connection.query(
            `SELECT c.product_id, c.quantity, p.name as product_name, p.price 
             FROM cart_items c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.customer_id = ?`,
            [req.session.user.id]
        );

        if (cartItems.length === 0) {
            await connection.rollback();
            return res.status(400).json({ error: 'Cart is empty' });
        }

        // Calculate total price
        let totalPrice = 0;
        for (const item of cartItems) {
            totalPrice += item.price * item.quantity;
        }

        // Check loyalty discount
        const loyaltyResult = await connection.query(
            'SELECT discount_active, discount_value, points_balance, discount_threshold, points_rate FROM loyalty WHERE customer_id = ?',
            [req.session.user.id]
        );

        let discountApplied = 0;
        let newPointsBalance = 0;
        let newDiscountActive = false;

        if (loyaltyResult.length > 0) {
            const loyalty = loyaltyResult[0];
            if (loyalty.discount_active) {
                discountApplied = loyalty.discount_value;
                totalPrice = Math.max(0, totalPrice - discountApplied);
            }

            // Calculate points earned
            const pointsEarned = Math.floor(totalPrice * loyalty.points_rate);
            newPointsBalance = loyalty.points_balance + pointsEarned;
            newDiscountActive = newPointsBalance >= loyalty.discount_threshold;
        }

        // Validate slot if collection
        if (fulfilment_type === 'collection') {
            const slots = await connection.query(
                'SELECT max_capacity, current_bookings FROM collection_slots WHERE id = ? AND is_available = TRUE',
                [collection_slot_id]
            );

            if (slots.length === 0 || slots[0].current_bookings >= slots[0].max_capacity) {
                await connection.rollback();
                return res.status(409).json({ error: 'Slot unavailable or full' });
            }
        }

        // Create order
        const orderResult = await connection.query(
            `INSERT INTO orders (customer_id, collection_slot_id, total_price, discount_applied, fulfilment_type, 
                                delivery_address_line1, delivery_address_line2, delivery_city, delivery_postcode, status)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending')`,
            [
                req.session.user.id,
                fulfilment_type === 'collection' ? collection_slot_id : null,
                totalPrice,
                discountApplied,
                fulfilment_type,
                delivery_address_line1 || null,
                delivery_address_line2 || null,
                delivery_city || null,
                delivery_postcode || null
            ]
        );

        const orderId = orderResult.insertId;

        // Insert order items
        for (const item of cartItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, product_id, product_name_snapshot, quantity, unit_price) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.product_id, item.product_name, item.quantity, item.price]
            );
        }

        // Update slot current_bookings if collection
        if (fulfilment_type === 'collection') {
            await connection.query(
                'UPDATE collection_slots SET current_bookings = current_bookings + 1 WHERE id = ?',
                [collection_slot_id]
            );
        }

        // Update loyalty points and discount
        if (loyaltyResult.length > 0) {
            if (loyaltyResult[0].discount_active) {
                // Reset after redemption
                newPointsBalance = 0;
                newDiscountActive = false;
            }
            await connection.query(
                'UPDATE loyalty SET points_balance = ?, discount_active = ? WHERE customer_id = ?',
                [newPointsBalance, newDiscountActive, req.session.user.id]
            );
        }

        // Clear cart
        await connection.query('DELETE FROM cart_items WHERE customer_id = ?', [req.session.user.id]);

        // Create notification
        await connection.query(
            'INSERT INTO notifications (customer_id, order_id, type, message) VALUES (?, ?, ?, ?)',
            [req.session.user.id, orderId, 'order_update', `Order #${orderId} confirmed`]
        );

        await connection.commit();

        return res.status(201).json({
            message: 'Order placed successfully',
            orderId,
            totalPrice,
            discountApplied
        });
    } catch (error) {
        await connection.rollback();
        console.error('Create order error:', error);
        return res.status(500).json({ error: 'Failed to place order' });
    } finally {
        await connection.release();
    }
});

// GET / - Order history
router.get('/', async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    try {
        const offset = (page - 1) * limit;
        const orders = await query(
            'SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
            [req.session.user.id, parseInt(limit), offset]
        );

        const countResult = await query('SELECT COUNT(*) as total FROM orders WHERE customer_id = ?', [req.session.user.id]);
        const total = countResult[0].total;

        return res.json({
            orders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get order history error:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// GET /:id - Single order with items
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const orders = await query(
            'SELECT * FROM orders WHERE id = ? AND customer_id = ?',
            [id, req.session.user.id]
        );

        if (orders.length === 0) {
            return res.status(404).json({ error: 'Order not found' });
        }

        const items = await query(
            'SELECT * FROM order_items WHERE order_id = ?',
            [id]
        );

        return res.json({
            order: orders[0],
            items
        });
    } catch (error) {
        console.error('Get order error:', error);
        return res.status(500).json({ error: 'Failed to fetch order' });
    }
});

export default router;
