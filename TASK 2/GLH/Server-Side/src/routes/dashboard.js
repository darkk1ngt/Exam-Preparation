import express from 'express';
import { query } from '../database/connection.js';
import { requireAuth } from '../utils/middleware.js';

const router = express.Router();

/* GET /api/dashboard — returns role-specific dashboard data */
router.get('/' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const role = request.userRole;

        if( role === 'admin' ){
            /* Admin overview */
            const [userStats] = await query(
                `SELECT
                   COUNT(*) AS total_users,
                   SUM(role = 'customer') AS customers,
                   SUM(role = 'producer') AS producers
                 FROM users`
            );

            const [orderStats] = await query(
                `SELECT
                   COUNT(*) AS total_orders,
                   SUM(status = 'pending') AS pending,
                   SUM(status = 'confirmed') AS confirmed,
                   SUM(status IN ('collected','delivered')) AS completed,
                   SUM(status = 'cancelled') AS cancelled,
                   ROUND(SUM(total_price), 2) AS total_revenue
                 FROM orders`
            );

            const [productStats] = await query(
                `SELECT COUNT(*) AS total_products ,
                   SUM(is_available = TRUE AND stock_quantity > 0) AS available
                 FROM products`
            );

            const recentOrders = await query(
                `SELECT o.id , o.status , o.total_price , o.created_at , u.email AS customer_email
                 FROM orders o
                 JOIN users u ON o.customer_id = u.id
                 ORDER BY o.created_at DESC LIMIT 10`
            );

            return response.json({
                role,
                user_stats : userStats,
                order_stats : orderStats,
                product_stats : productStats,
                recent_orders : recentOrders
            });
        }

        if( role === 'producer' ){
            /* Producer overview */
            const [productStats] = await query(
                `SELECT COUNT(*) AS total_products ,
                   SUM(is_available = TRUE) AS active ,
                   SUM(stock_quantity) AS total_stock
                 FROM products WHERE producer_id = ?`,
                [userId]
            );

            const recentSales = await query(
                `SELECT oi.product_name_snapshot , SUM(oi.quantity) AS units_sold ,
                   ROUND(SUM(oi.quantity * oi.unit_price), 2) AS revenue
                 FROM order_items oi
                 JOIN products p ON oi.product_id = p.id
                 JOIN orders o ON oi.order_id = o.id
                 WHERE p.producer_id = ? AND o.status NOT IN ('cancelled')
                 GROUP BY oi.product_id , oi.product_name_snapshot
                 ORDER BY revenue DESC LIMIT 5`,
                [userId]
            );

            const myProducts = await query(
                `SELECT id , name , price , stock_quantity , is_available
                 FROM products WHERE producer_id = ?
                 ORDER BY created_at DESC LIMIT 10`,
                [userId]
            );

            return response.json({
                role,
                product_stats : productStats,
                top_sales : recentSales,
                my_products : myProducts
            });
        }

        /* Customer dashboard */
        const recentOrders = await query(
            `SELECT o.id , o.status , o.total_price , o.fulfilment_type , o.created_at ,
             cs.slot_date , cs.slot_time
             FROM orders o
             LEFT JOIN collection_slots cs ON o.collection_slot_id = cs.id
             WHERE o.customer_id = ?
             ORDER BY o.created_at DESC LIMIT 5`,
            [userId]
        );

        const loyaltyRows = await query(
            `SELECT points_balance , discount_active , discount_value , discount_threshold
             FROM loyalty WHERE customer_id = ?`,
            [userId]
        );

        const [unread] = await query(
            `SELECT COUNT(*) AS count FROM notifications WHERE customer_id = ? AND is_read = FALSE`,
            [userId]
        );

        response.json({
            role,
            recent_orders : recentOrders,
            loyalty : loyaltyRows.length > 0 ? loyaltyRows[0] : null,
            unread_notifications : unread.count
        });
    }catch( error ){
        console.error(`Error fetching dashboard: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch dashboard.' });
    }
});

export default router;