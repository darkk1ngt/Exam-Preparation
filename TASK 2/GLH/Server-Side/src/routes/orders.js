import express from 'express';
import { query } from '../database/connection.js';
import { requireAuth , requireAdmin } from '../utils/middleware.js';

const router = express.Router();

/* GET /api/orders — get all orders for the logged-in user (admin sees all) */
router.get('/' , requireAuth , async( request , response )=>{
    try{
        const isAdmin = request.userRole === 'admin';

        let sql = `SELECT o.id , o.total_price , o.discount_applied , o.status ,
                   o.fulfilment_type , o.created_at , o.updated_at ,
                   cs.slot_date , cs.slot_time
                   FROM orders o
                   LEFT JOIN collection_slots cs ON o.collection_slot_id = cs.id`;
        const params = [];

        if( !isAdmin ){
            sql += ' WHERE o.customer_id = ?';
            params.push(request.userId);
        }

        sql += ' ORDER BY o.created_at DESC';

        const orders = await query(sql , params);
        response.json({ orders });
    }catch( error ){
        console.error(`Error fetching orders: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch orders.' });
    }
});

/* GET /api/orders/:id — get a specific order with its items */
router.get('/:id' , requireAuth , async( request , response )=>{
    try{
        const { id } = request.params;
        const isAdmin = request.userRole === 'admin';

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid order ID.' });
        }

        const orderSql = isAdmin
            ? `SELECT o.* , cs.slot_date , cs.slot_time
               FROM orders o
               LEFT JOIN collection_slots cs ON o.collection_slot_id = cs.id
               WHERE o.id = ?`
            : `SELECT o.* , cs.slot_date , cs.slot_time
               FROM orders o
               LEFT JOIN collection_slots cs ON o.collection_slot_id = cs.id
               WHERE o.id = ? AND o.customer_id = ?`;

        const orderParams = isAdmin ? [id] : [id , request.userId];
        const orders = await query(orderSql , orderParams);

        if( orders.length === 0 ){
            return response.status(isAdmin ? 404 : 403).json({
                error : isAdmin ? 'Order not found.' : 'Access denied.'
            });
        }

        const order = orders[0];

        const items = await query(
            `SELECT oi.id , oi.product_id , oi.product_name_snapshot ,
             oi.quantity , oi.unit_price ,
             (oi.quantity * oi.unit_price) AS line_total
             FROM order_items oi WHERE oi.order_id = ?`,
            [id]
        );

        const orderNotifications = await query(
            `SELECT id , message , is_read , created_at
             FROM notifications
             WHERE customer_id = ? AND order_id = ? AND type = 'order_update'
             ORDER BY created_at DESC`,
            [order.customer_id , id]
        );

        response.json({ order , items , order_notifications : orderNotifications });
    }catch( error ){
        console.error(`Error fetching order: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch order.' });
    }
});

/* POST /api/orders — place an order from the current cart */
router.post('/' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { fulfilment_type , collection_slot_id , delivery_address_line1 ,
                delivery_address_line2 , delivery_city , delivery_postcode } = request.body;

        if( !fulfilment_type || !['collection','delivery'].includes(fulfilment_type) ){
            return response.status(400).json({ error : 'fulfilment_type must be \'collection\' or \'delivery\'.' });
        }

        if( fulfilment_type === 'collection' && !collection_slot_id ){
            return response.status(400).json({ error : 'collection_slot_id is required for collection orders.' });
        }

        if( fulfilment_type === 'delivery' && !delivery_address_line1 ){
            return response.status(400).json({ error : 'Delivery address is required for delivery orders.' });
        }

        /* Fetch cart items */
        const cartItems = await query(
            `SELECT ci.product_id , ci.quantity , p.price , p.name , p.stock_quantity , p.is_available
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.customer_id = ?`,
            [userId]
        );

        if( cartItems.length === 0 ){
            return response.status(400).json({ error : 'Your cart is empty.' });
        }

        /* Validate stock for all items */
        for( const item of cartItems ){
            if( !item.is_available ){
                return response.status(409).json({ error : `Product '${item.name}' is no longer available.` });
            }
            if( item.quantity > item.stock_quantity ){
                return response.status(409).json({ error : `Only ${item.stock_quantity} units of '${item.name}' available.` });
            }
        }

        /* Validate collection slot capacity */
        if( fulfilment_type === 'collection' ){
            const slots = await query(
                `SELECT id , max_capacity , current_bookings , is_available
                 FROM collection_slots WHERE id = ?`,
                [collection_slot_id]
            );
            if( slots.length === 0 ){
                return response.status(404).json({ error : 'Collection slot not found.' });
            }
            const slot = slots[0];
            if( !slot.is_available || slot.current_bookings >= slot.max_capacity ){
                return response.status(409).json({ error : 'Selected collection slot is full or unavailable.' });
            }
        }

        /* Fetch loyalty for discount */
        const loyaltyRows = await query(
            `SELECT points_balance , discount_active , discount_value , points_rate , discount_threshold
             FROM loyalty WHERE customer_id = ?`,
            [userId]
        );
        const loyalty = loyaltyRows.length > 0 ? loyaltyRows[0] : null;
        const discountApplied = loyalty && loyalty.discount_active
            ? parseFloat(loyalty.discount_value)
            : 0;

        /* Calculate totals */
        const subtotal = cartItems.reduce((sum , item) => sum + (item.quantity * parseFloat(item.price)) , 0);
        const totalPrice = Math.max(0 , subtotal - discountApplied).toFixed(2);

        /* Insert order */
        const orderResult = await query(
            `INSERT INTO orders
             (customer_id , collection_slot_id , total_price , discount_applied , fulfilment_type ,
              delivery_address_line1 , delivery_address_line2 , delivery_city , delivery_postcode)
             VALUES (? , ? , ? , ? , ? , ? , ? , ? , ?)`,
            [
                userId , fulfilment_type === 'collection' ? collection_slot_id : null ,
                totalPrice , discountApplied , fulfilment_type ,
                delivery_address_line1 ?? null , delivery_address_line2 ?? null ,
                delivery_city ?? null , delivery_postcode ?? null
            ]
        );

        const orderId = orderResult.insertId;

        /* Insert order items & reduce stock */
        for( const item of cartItems ){
            await query(
                `INSERT INTO order_items (order_id , product_id , product_name_snapshot , quantity , unit_price)
                 VALUES (? , ? , ? , ? , ?)`,
                [orderId , item.product_id , item.name , item.quantity , item.price]
            );
            await query(
                `UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?`,
                [item.quantity , item.product_id]
            );
        }

        /* Increment slot bookings */
        if( fulfilment_type === 'collection' && collection_slot_id ){
            await query(
                `UPDATE collection_slots SET current_bookings = current_bookings + 1 WHERE id = ?`,
                [collection_slot_id]
            );
        }

        /* Award / reset loyalty points */
        if( loyalty ){
            const pointsEarned = Math.floor(parseFloat(totalPrice) * parseFloat(loyalty.points_rate));
            const baseBalance = discountApplied > 0 ? 0 : Number(loyalty.points_balance);
            const newBalance = baseBalance + pointsEarned;
            const newDiscountActive = newBalance >= loyalty.discount_threshold;
            await query(
                `UPDATE loyalty SET points_balance = ? , discount_active = ? WHERE customer_id = ?`,
                [newBalance , newDiscountActive , userId]
            );
        } else {
            /* Create loyalty record for first-time orderers */
            const pointsEarned = Math.floor(parseFloat(totalPrice));
            await query(
                `INSERT INTO loyalty (customer_id , points_balance) VALUES (? , ?)`,
                [userId , pointsEarned]
            );
        }

        /* Clear cart */
        await query(`DELETE FROM cart_items WHERE customer_id = ?` , [userId]);

        /* Create notification */
        await query(
            `INSERT INTO notifications (customer_id , order_id , type , message)
             VALUES (? , ? , 'order_update' , ?)`,
            [userId , orderId , `Your order #${orderId} has been placed and is pending confirmation.`]
        );

        response.status(201).json({ message : 'Order placed successfully.' , orderId });
    }catch( error ){
        console.error(`Error placing order: ${error.message}`);
        response.status(500).json({ error : 'Failed to place order.' });
    }
});

/* PATCH /api/orders/:id/status — admin updates order status */
router.patch('/:id/status' , requireAuth , requireAdmin , async( request , response )=>{
    try{
        const { id } = request.params;
        const { status } = request.body;

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid order ID.' });
        }

        const validStatuses = ['pending','confirmed','ready','out_for_delivery','collected','delivered','cancelled'];
        if( !status || !validStatuses.includes(status) ){
            return response.status(400).json({ error : `status must be one of: ${validStatuses.join(', ')}.` });
        }

        const orders = await query(`SELECT id , customer_id FROM orders WHERE id = ?` , [id]);
        if( orders.length === 0 ){
            return response.status(404).json({ error : 'Order not found.' });
        }

        await query(`UPDATE orders SET status = ? WHERE id = ?` , [status , id]);

        /* Notify customer */
        await query(
            `INSERT INTO notifications (customer_id , order_id , type , message)
             VALUES (? , ? , 'order_update' , ?)`,
            [orders[0].customer_id , id , `Your order #${id} status has been updated to '${status}'.`]
        );

        response.json({ message : 'Order status updated.' });
    }catch( error ){
        console.error(`Error updating order status: ${error.message}`);
        response.status(500).json({ error : 'Failed to update order status.' });
    }
});

/* DELETE /api/orders/:id — customer cancels a pending order */
router.delete('/:id' , requireAuth , async( request , response )=>{
    try{
        const { id } = request.params;
        const isAdmin = request.userRole === 'admin';

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid order ID.' });
        }

        const ownershipSql = isAdmin
            ? `SELECT id , customer_id , status , collection_slot_id FROM orders WHERE id = ?`
            : `SELECT id , customer_id , status , collection_slot_id
               FROM orders WHERE id = ? AND customer_id = ?`;
        const ownershipParams = isAdmin ? [id] : [id , request.userId];
        const orders = await query(ownershipSql , ownershipParams);

        if( orders.length === 0 ){
            return response.status(isAdmin ? 404 : 403).json({
                error : isAdmin ? 'Order not found.' : 'Access denied.'
            });
        }

        const order = orders[0];

        if( order.status !== 'pending' ){
            return response.status(409).json({ error : 'Only pending orders can be cancelled.' });
        }

        /* Restore stock */
        const items = await query(
            `SELECT product_id , quantity FROM order_items WHERE order_id = ?`,
            [id]
        );
        for( const item of items ){
            await query(
                `UPDATE products SET stock_quantity = stock_quantity + ? WHERE id = ?`,
                [item.quantity , item.product_id]
            );
        }

        /* Free the collection slot */
        if( order.collection_slot_id ){
            await query(
                `UPDATE collection_slots SET current_bookings = GREATEST(current_bookings - 1, 0) WHERE id = ?`,
                [order.collection_slot_id]
            );
        }

        const cancelSql = isAdmin
            ? `UPDATE orders SET status = 'cancelled' WHERE id = ? AND status = 'pending'`
            : `UPDATE orders
               SET status = 'cancelled'
               WHERE id = ? AND customer_id = ? AND status = 'pending'`;
        const cancelParams = isAdmin ? [id] : [id , request.userId];

        const cancelResult = await query(cancelSql , cancelParams);
        if( cancelResult.affectedRows === 0 ){
            return response.status(409).json({ error : 'Order can no longer be cancelled.' });
        }

        await query(
            `INSERT INTO notifications (customer_id , order_id , type , message)
             VALUES (? , ? , 'order_update' , ?)`,
            [order.customer_id , id , `Your order #${id} has been cancelled.`]
        );

        response.json({ message : 'Order cancelled.' });
    }catch( error ){
        console.error(`Error cancelling order: ${error.message}`);
        response.status(500).json({ error : 'Failed to cancel order.' });
    }
});

export default router;