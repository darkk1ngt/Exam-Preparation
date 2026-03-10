import express from 'express';
import { query } from '../database/connection.js';
import { requireAuth } from '../utils/middleware.js';

const router = express.Router();

/* Fetch logged in users profile and preferences */

router.get('/' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;

        /* Fetch user */

        const users = await query(
            `SELECT id , email , role , created_at FROM users WHERE id = ?`,
            [userId]
        );

        if( users.length === 0 ){
            return response.status(404).json({
                error : 'User not found.'
            });
        }
        /* Fetch preferences */

        const prefs = await query(
            `SELECT * FROM user_preferences WHERE user_id = ?`,
            [userId]
        );

        const user = users[0];
        const preferences = prefs.length > 0 ? prefs[ 0 ] : null;
        
        response.json({
            user : {
                id : user.id,
                email : user.email,
                role : user.role,
                created_at : user.created_at
            },
            preferences : preferences
        });
    }catch( error ){
        console.error(`Error fetching profile:${error.message}`);
        response.status(500).json({
            error : 'Failed to fetch profile.'
        });
    }
});

/* Update user preferences */

router.patch('/preferences' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { notifications_enabled , preferred_attractions , distance_alert_threshold } = 
        request.body;

        /* Validate inputs */

        if( notifications_enabled !== undefined && typeof notifications_enabled !== 'boolean'){
            return response.status(400).json({
                error : 'notifications_enabled must be boolean.'
            });
        }

        if( preferred_attractions !== undefined && typeof preferred_attractions !== 'string'){
            return response.status(400).json({
                error : 'preferred_attractions must be a JSON string.'
            });
        }

        if( distance_alert_threshold !== undefined && (isNaN(distance_alert_threshold) || distance_alert_threshold < 0 )){
            return response.status(400).json({
                error : 'distance_alert_threshold must be a non-negative number.'
            });
        }

        /* Check if preferences exist */

        const prefs = await query(
            `SELECT id FROM user_preferences WHERE user_id = ?`,
            [userId]
        );

        if( prefs.length === 0 ){

            /* Generate new preferences */

            await query(
                `INSERT INTO user_preferences
                ( user_id , notifications_enabled , preferred_attractions,
                distance_alert_threshold ) VALUES ( ? , ? , ? , ? )`,
                [ userId , notifications_enabled ?? true , preferred_attractions ?? '[]' , distance_alert_threshold ?? 500]
            );
        }else{

            /* Update existing */
            
            const updateFields = [];
            const updateValues = [];

            if( notifications_enabled !== undefined ){
                updateFields.push('notifications_enabled = ?');
                updateValues.push(notifications_enabled);
            }

            if( preferred_attractions !== undefined ){
                updateFields.push('preferred_attractions = ?');
                updateValues.push(preferred_attractions);
            }
            
            if( distance_alert_threshold !== undefined ){
                updateFields.push('distance_alert_threshold = ?');
                updateValues.push(distance_alert_threshold);
            }

            if( updateFields.length > 0 ){
                updateValues.push(userId);
                await query(
                    `UPDATE user_preferences SET ${updateFields.join( ' , ' )} WHERE user_id = ? `,
                    updateValues
                );
            }
        }

        /* Return upated preferences */

        const updated = await query(
            `SELECT * FROM user_preferences WHERE user_id = ? `,
            [userId]
        );

        return response.json({
            message : 'Preferences updated',
            preferences : updated[0]
        });
    }catch(error){
        console.error(`Error updating preferences:${error.message}`);
        response.status(500).json({
            error : 'Failed to update preferences.'
        });
    }
});

export default router;