import express from 'express';
import { query } from '../database/connection.js';
import { requireAuth } from '../utils/middleware.js';

const router = express.Router();

/* GET /api/notifications — get notifications for logged-in user */
router.get('/' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { unread_only } = request.query;

        let sql = `SELECT id , type , message , is_read , order_id , product_id , created_at
                   FROM notifications WHERE customer_id = ?`;
        const params = [userId];

        if( unread_only === 'true' ){
            sql += ' AND is_read = FALSE';
        }

        sql += ' ORDER BY created_at DESC';

        const notifications = await query(sql , params);
        const unreadCount = notifications.filter(n => !n.is_read).length;

        response.json({ notifications , unread_count : unreadCount });
    }catch( error ){
        console.error(`Error fetching notifications: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch notifications.' });
    }
});

/* PATCH /api/notifications/:id/read — mark a single notification as read */
router.patch('/:id/read' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { id } = request.params;

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid notification ID.' });
        }

        const result = await query(
            `UPDATE notifications SET is_read = TRUE WHERE id = ? AND customer_id = ?`,
            [id , userId]
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

/* PATCH /api/notifications/read-all — mark all as read */
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