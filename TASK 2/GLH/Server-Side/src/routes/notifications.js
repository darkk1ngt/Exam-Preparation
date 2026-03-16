import express from 'express';
import { query } from '../database/connection.js';
import { requireAuth } from '../utils/middleware.js';

const router = express.Router();

/* GET /api/notifications — get notifications for logged-in user */
router.get('/' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { unread_only , limit , order_id , type } = request.query;

        let sql = `SELECT id , type , message , is_read , order_id , product_id , created_at
                   FROM notifications WHERE customer_id = ?`;
        const params = [userId];

        if( unread_only === 'true' ){
            sql += ' AND is_read = FALSE';
        }

        if( order_id ){
            sql += ' AND order_id = ?';
            params.push(order_id);
        }

        if( type ){
            sql += ' AND type = ?';
            params.push(type);
        }

        sql += ' ORDER BY created_at DESC';

        if( limit && !isNaN(limit) ){
            sql += ' LIMIT ?';
            params.push(Math.max(1, Math.min(100, parseInt(limit))));
        }

        const notifications = await query(sql , params);

        const unreadRows = await query(
            `SELECT COUNT(*) AS unread_count
             FROM notifications
             WHERE customer_id = ? AND is_read = FALSE`,
            [userId]
        );
        const unreadCount = unreadRows[0]?.unread_count ?? 0;

        response.json({ notifications , unread_count : unreadCount });
    }catch( error ){
        console.error(`Error fetching notifications: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch notifications.' });
    }
});

/* PATCH /api/notifications/read-all — mark all as read */
/* NOTE: must be defined before /:notification_id/read to prevent Express matching "read-all" as a param */
router.patch('/read-all' , requireAuth , async( request , response )=>{
    try{
        await query(
            `UPDATE notifications SET is_read = TRUE WHERE customer_id = ? AND is_read = FALSE`,
            [request.userId]
        );
        response.json({ message : 'All notifications marked as read.' });
    }catch( error ){
        console.error(`Error marking all notifications: ${error.message}`);
        response.status(500).json({ error : 'Failed to update notifications.' });
    }
});

/* PATCH /api/notifications/:notification_id/read — mark a single notification as read */
router.patch('/:notification_id/read' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { notification_id } = request.params;

        if( isNaN(notification_id) ){
            return response.status(400).json({ error : 'Invalid notification ID.' });
        }

        const result = await query(
            `UPDATE notifications SET is_read = TRUE WHERE id = ? AND customer_id = ?`,
            [notification_id , userId]
        );

        if( result.affectedRows === 0 ){
            return response.status(404).json({ error : 'Notification not found.' });
        }

        response.json({ message : 'Notification marked as read.' });
    }catch( error ){
        console.error(`Error marking notification: ${error.message}`);
        response.status(500).json({ error : 'Failed to update notification.' });
    }
});

/* DELETE /api/notifications/:id — delete a notification */
router.delete('/:id' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { id } = request.params;

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid notification ID.' });
        }

        const result = await query(
            `DELETE FROM notifications WHERE id = ? AND customer_id = ?`,
            [id , userId]
        );

        if( result.affectedRows === 0 ){
            return response.status(404).json({ error : 'Notification not found.' });
        }

        response.json({ message : 'Notification deleted.' });
    }catch( error ){
        console.error(`Error deleting notification: ${error.message}`);
        response.status(500).json({ error : 'Failed to delete notification.' });
    }
});

export default router;