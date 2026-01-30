import express, { request, response } from 'express';
import { query } from '../database/connection.js';
import { requireAuth } from '../utils/middleware.js';

const router = express.Router();

/* Enable notifications for logged in user */

router.post('/subscribe' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;

        /* Validate if prefernces record exists */
        const prefs = await query(
            `SELECT id FROM user_preferences WHERE user_id = ?`,
            [userId]);

        /* Create new preference record */
        if( prefs.length === 0 ){
            await query(
                `INSERT INTO user_preferences ( user_id , notifications_enabled)
                VALUES ( ? , TRUE )`,
            [userId]);

        /* Update existing preference */
        }else{
            await query(
                `UPDATE user_preferences SET notifications_enabled = TRUE WHERE
                user_id = ?`,
                [userId]);
        }

        response.json({
            message : 'Notifications enabled.'
        });
    }catch( error ){
        console.error(`Subscription error: ${error.message}`);
        response.status(500).json({
            error : 'Failed to enable notifications.'
        });
    }
});

/* Disable notifications for logged in users. */
router.post('/unsubscribe', requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;

        const prefs = await query(
            `SELECT id FROM user_preferences WHERE user_id = ? `,
            [userId]
        );

        /* Create new preference record with notifications disabled */
        if( prefs.length === 0 ){
            await query(
                'INSERT INTO user_preferences ( user_id , notifications_enabled ) VALUES ( ? , FALSE )',
                [userId]
            )
        }else{
            await query(
                `UPDATE user_preferences SET notifications_enabled = FALSE WHERE user_id = ?`,
                [userId]
            );
        }

        response.json({
            message : 'Notifications disabled.'
        });
    }catch( error ){
        console.error(`Unsubscription error: ${error.message}`);
        response.status(500).json({
            error : 'Failed to disable notifications.'
        });
    }
});

/* Fetch unread notifications for logged in users */

router.get('/' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const limit = request.query.limit || 20;

        const notifications = await query(`
            SELECT
                n.id,
                n.user_id,
                n.attraction_id,
                n.type,
                n.message,
                n.is_read,
                n.created_at,
                a.name as attraction name
                FROM notifications n
                LEFT JOIN attractions a ON n.attraction_id = a.id
                WHERE n.user_id = ?
                ORDER BY n.created_At DESC
                LIMIT ?
                `, [ userId , parseInt(limit)]);

        response.json({
            notifications : notifications
        });
    }catch( error ){
        console.error(`Fetch notifications error: ${error.message}`);
        response.status(500).json({
            error : 'Failed to fetch notifications.'
        });
    }
});

/* Mark notifications as read */

router.patch(`/:id/read` , requireAuth , async ( request , response )=>{
    try{
        const { id } = request.params;
        const userId = request.userId;

        /* Verify notifications belong to user */
        const notifs = await query(
            `SELECT id FROM notifications WHERE id = ? AND user_id = ?`,
            [ id , userId ]
        );

        if( notifs.length === 0 ){
            return response.status(400).json({
                error : 'Notifications not found.'
            });
        }

        await query(
            `UPDATE notifications SET is_read = TRUE WHERE id = ? `,
            [id]
        );

        response.json({
            message : 'Notifications marked as read.'
        });

    }catch( error ){
        console.error(`Error marking notification: ${error.message}`);
        response.status(500).json({
            error : 'Failed to update notification.'
        });
    }
});

export default router;