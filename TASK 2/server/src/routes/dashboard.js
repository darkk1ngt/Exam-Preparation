import express from 'express';
import { query, getPool } from '../database/connection.js';
import multer from 'multer';
import cloudinary from 'cloudinary';
import { requireProducer } from '../utils/middleware.js';

const router = express.Router();

router.use(requireProducer);

const STATUS_TRANSITIONS = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['ready', 'cancelled'],
    ready: ['out_for_delivery', 'collected', 'cancelled'],
    out_for_delivery: ['delivered', 'cancelled'],
    collected: [],
    delivered: [],
    cancelled: []
};

function normalizeProductPayload(body) {
    const normalized = {};

    if (body.name !== undefined) {
        normalized.name = typeof body.name === 'string' ? body.name.trim() : body.name;
    }

    if (body.description !== undefined) {
        normalized.description = typeof body.description === 'string' ? body.description.trim() : body.description;
    }

    if (body.category !== undefined) {
        normalized.category = typeof body.category === 'string' ? body.category.trim() : body.category;
    }

    if (body.image_url !== undefined) {
        normalized.image_url = typeof body.image_url === 'string' ? body.image_url.trim() : body.image_url;
    }

    if (body.price !== undefined) {
        normalized.price = Number(body.price);
    }

    if (body.stock_quantity !== undefined) {
        normalized.stock_quantity = Number(body.stock_quantity);
    }

    return normalized;
}

function validateProductPayload(payload, { requireNameAndPrice = false } = {}) {
    if (requireNameAndPrice && (!payload.name || payload.price === undefined || Number.isNaN(payload.price))) {
        return 'name and valid price required';
    }

    if (payload.name !== undefined && (!payload.name || payload.name.length < 2 || payload.name.length > 150)) {
        return 'name must be between 2 and 150 characters';
    }

    if (payload.price !== undefined && (Number.isNaN(payload.price) || payload.price <= 0)) {
        return 'price must be a positive number';
    }

    if (payload.stock_quantity !== undefined && (!Number.isInteger(payload.stock_quantity) || payload.stock_quantity < 0)) {
        return 'stock_quantity must be a non-negative integer';
    }

    return null;
}

// Multer config for image upload
const upload = multer({ storage: multer.memoryStorage() });

// GET /overview
router.get('/overview', async (req, res) => {
    try {
        const productCount = await query(
            'SELECT COUNT(*) as count FROM products WHERE producer_id = ?',
            [req.session.user.id]
        );

        const pendingOrders = await query(
            `SELECT COUNT(DISTINCT o.id) as count FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             JOIN products p ON oi.product_id = p.id
             WHERE p.producer_id = ? AND o.status IN ('pending', 'confirmed')`,
            [req.session.user.id]
        );

        const weeklyRevenue = await query(
            `SELECT SUM(oi.unit_price * oi.quantity) as revenue FROM order_items oi
             JOIN products p ON oi.product_id = p.id
             JOIN orders o ON oi.order_id = o.id
             WHERE p.producer_id = ? AND o.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
            [req.session.user.id]
        );

        const lowStock = await query(
            'SELECT COUNT(*) as count FROM products WHERE producer_id = ? AND stock_quantity < 5',
            [req.session.user.id]
        );

        return res.json({
            product_count: productCount[0].count,
            pending_orders: pendingOrders[0].count,
            weekly_revenue: weeklyRevenue[0].revenue || 0,
            low_stock_count: lowStock[0].count
        });
    } catch (error) {
        console.error('Get overview error:', error);
        return res.status(500).json({ error: 'Failed to fetch overview' });
    }
});

// GET /products
router.get('/products', async (req, res) => {
    try {
        const products = await query(
            'SELECT * FROM products WHERE producer_id = ? ORDER BY created_at DESC',
            [req.session.user.id]
        );
        return res.json({ products });
    } catch (error) {
        console.error('Get products error:', error);
        return res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// POST /products
router.post('/products', async (req, res) => {
    const payload = normalizeProductPayload(req.body);
    const validationError = validateProductPayload(payload, { requireNameAndPrice: true });
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    try {
        const result = await query(
            'INSERT INTO products (producer_id, name, description, category, price, stock_quantity, image_url, is_available) VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)',
            [
                req.session.user.id,
                payload.name,
                payload.description || null,
                payload.category || null,
                payload.price,
                payload.stock_quantity ?? 0,
                payload.image_url || null
            ]
        );
        return res.status(201).json({ productId: result.insertId });
    } catch (error) {
        console.error('Create product error:', error);
        return res.status(500).json({ error: 'Failed to create product' });
    }
});

// PUT /products/:id
router.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const payload = normalizeProductPayload(req.body);
    const validationError = validateProductPayload(payload);
    if (validationError) {
        return res.status(400).json({ error: validationError });
    }

    try {
        // Verify ownership
        const products = await query(
            'SELECT producer_id FROM products WHERE id = ?',
            [id]
        );

        if (products.length === 0 || products[0].producer_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const updates = [];
        const values = [];

        if (payload.name !== undefined) { updates.push('name = ?'); values.push(payload.name); }
        if (payload.description !== undefined) { updates.push('description = ?'); values.push(payload.description); }
        if (payload.category !== undefined) { updates.push('category = ?'); values.push(payload.category); }
        if (payload.price !== undefined) { updates.push('price = ?'); values.push(payload.price); }
        if (payload.stock_quantity !== undefined) { updates.push('stock_quantity = ?'); values.push(payload.stock_quantity); }
        if (payload.image_url !== undefined) { updates.push('image_url = ?'); values.push(payload.image_url); }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id);
        await query(`UPDATE products SET ${updates.join(', ')} WHERE id = ?`, values);

        return res.json({ message: 'Product updated' });
    } catch (error) {
        console.error('Update product error:', error);
        return res.status(500).json({ error: 'Failed to update product' });
    }
});

// DELETE /products/:id
router.delete('/products/:id', async (req, res) => {
    const { id } = req.params;

    try {
        // Verify ownership
        const products = await query(
            'SELECT producer_id FROM products WHERE id = ?',
            [id]
        );

        if (products.length === 0 || products[0].producer_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await query('DELETE FROM products WHERE id = ?', [id]);
        return res.json({ message: 'Product deleted' });
    } catch (error) {
        console.error('Delete product error:', error);
        return res.status(500).json({ error: 'Failed to delete product' });
    }
});

// PATCH /products/:id/toggle
router.patch('/products/:id/toggle', async (req, res) => {
    const { id } = req.params;

    try {
        // Verify ownership
        const products = await query(
            'SELECT producer_id, is_available FROM products WHERE id = ?',
            [id]
        );

        if (products.length === 0 || products[0].producer_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const newAvailability = !products[0].is_available;
        await query('UPDATE products SET is_available = ? WHERE id = ?', [newAvailability, id]);

        // Insert notifications for affected customers
        const customers = await query(
            'SELECT DISTINCT o.customer_id FROM orders o JOIN order_items oi ON o.id = oi.order_id WHERE oi.product_id = ?',
            [id]
        );

        for (const customer of customers) {
            await query(
                'INSERT INTO notifications (customer_id, product_id, type, message) VALUES (?, ?, ?, ?)',
                [customer.customer_id, id, 'product_available', newAvailability ? 'Product now available' : 'Product no longer available']
            );
        }

        return res.json({ message: 'Availability toggled', is_available: newAvailability });
    } catch (error) {
        console.error('Toggle availability error:', error);
        return res.status(500).json({ error: 'Failed to toggle availability' });
    }
});

// PUT /products/:id/stock
router.put('/products/:id/stock', async (req, res) => {
    const { id } = req.params;
    const { stock_quantity } = req.body;

    if (stock_quantity === undefined || stock_quantity < 0) {
        return res.status(400).json({ error: 'Invalid stock_quantity' });
    }

    try {
        // Verify ownership
        const products = await query(
            'SELECT producer_id FROM products WHERE id = ?',
            [id]
        );

        if (products.length === 0 || products[0].producer_id !== req.session.user.id) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        await query('UPDATE products SET stock_quantity = ? WHERE id = ?', [stock_quantity, id]);
        return res.json({ message: 'Stock updated' });
    } catch (error) {
        console.error('Update stock error:', error);
        return res.status(500).json({ error: 'Failed to update stock' });
    }
});

// GET /orders
router.get('/orders', async (req, res) => {
    try {
        const orders = await query(
            `SELECT DISTINCT o.* FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             JOIN products p ON oi.product_id = p.id
             WHERE p.producer_id = ?
             ORDER BY o.created_at DESC`,
            [req.session.user.id]
        );
        return res.json({ orders });
    } catch (error) {
        console.error('Get orders error:', error);
        return res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// PUT /orders/:id/status
router.put('/orders/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'confirmed', 'ready', 'out_for_delivery', 'collected', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        // Verify order involves this producer
        const orderCheck = await query(
            `SELECT o.id, o.status FROM orders o
             JOIN order_items oi ON o.id = oi.order_id
             JOIN products p ON oi.product_id = p.id
             WHERE o.id = ? AND p.producer_id = ?`,
            [id, req.session.user.id]
        );

        if (orderCheck.length === 0) {
            return res.status(403).json({ error: 'Not authorized' });
        }

        const currentStatus = orderCheck[0].status;
        if (currentStatus === status) {
            return res.status(400).json({ error: 'Order already has this status' });
        }

        const allowedNextStatuses = STATUS_TRANSITIONS[currentStatus] || [];
        if (!allowedNextStatuses.includes(status)) {
            return res.status(400).json({
                error: `Invalid status transition from ${currentStatus} to ${status}`
            });
        }

        await query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);

        // Insert notification
        const orderResult = await query('SELECT customer_id FROM orders WHERE id = ?', [id]);
        if (orderResult.length > 0) {
            await query(
                'INSERT INTO notifications (customer_id, order_id, type, message) VALUES (?, ?, ?, ?)',
                [orderResult[0].customer_id, id, 'order_update', `Order #${id} status: ${status}`]
            );
        }

        return res.json({ message: 'Status updated' });
    } catch (error) {
        console.error('Update status error:', error);
        return res.status(500).json({ error: 'Failed to update status' });
    }
});

// GET /analytics
router.get('/analytics', async (req, res) => {
    const { start, end } = req.query;

    try {
        let sql = `SELECT SUM(oi.unit_price * oi.quantity) as sales, COUNT(DISTINCT o.id) as orders, p.category
                   FROM order_items oi
                   JOIN products p ON oi.product_id = p.id
                   JOIN orders o ON oi.order_id = o.id
                   WHERE p.producer_id = ?`;
        const params = [req.session.user.id];

        if (start) {
            sql += ' AND o.created_at >= ?';
            params.push(start);
        }
        if (end) {
            sql += ' AND o.created_at <= ?';
            params.push(end);
        }

        sql += ' GROUP BY p.category';

        const analytics = await query(sql, params);
        return res.json({ analytics });
    } catch (error) {
        console.error('Get analytics error:', error);
        return res.status(500).json({ error: 'Failed to fetch analytics' });
    }
});

// POST /products/upload - multer image upload
router.post('/products/upload', upload.single('image'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file provided' });
    }

    try {
        // If Cloudinary is configured, use it; otherwise return placeholder
        if (!process.env.CLOUDINARY_URL) {
            const placeholderUrl = `/uploads/product-${Date.now()}.jpg`;
            return res.json({ image_url: placeholderUrl });
        }

        const result = await new Promise((resolve, reject) => {
            const stream = cloudinary.v2.uploader.upload_stream(
                { resource_type: 'auto' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            stream.end(req.file.buffer);
        });

        return res.json({ image_url: result.secure_url });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: 'Upload failed' });
    }
});

export default router;

