import express from 'express';
import bcrypt from 'bcrypt';
import { query } from '../database/connection.js';
import { requireAuth } from '../utils/middleware.js';

const router = express.Router();

/* GET /api/account — account-safe profile payload */
router.get('/' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;

        const users = await query(
            `SELECT id , email , created_at
             FROM users
             WHERE id = ?`,
            [userId]
        );

        if( users.length === 0 ){
            return response.status(404).json({ error : 'User not found.' });
        }

        const lastOrders = await query(
            `SELECT id , status , fulfilment_type , total_price , created_at
             FROM orders
             WHERE customer_id = ?
             ORDER BY created_at DESC
             LIMIT 3`,
            [userId]
        );

        const loyaltyRows = await query(
            `SELECT points_balance , discount_active
             FROM loyalty
             WHERE customer_id = ?`,
            [userId]
        );

        response.json({
            account : users[0],
            last_orders : lastOrders,
            loyalty_summary : loyaltyRows[0] ?? { points_balance : 0 , discount_active : false }
        });
    }catch( error ){
        console.error(`Error fetching account: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch account.' });
    }
});

/* PATCH /api/account/email — requires current password */
router.patch('/email' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { current_password , new_email } = request.body;

        if( !current_password || !new_email ){
            return response.status(400).json({ error : 'current_password and new_email are required.' });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if( !emailRegex.test(new_email) ){
            return response.status(400).json({ error : 'Invalid email format.' });
        }

        const users = await query(
            `SELECT id , password_hash FROM users WHERE id = ?`,
            [userId]
        );

        if( users.length === 0 ){
            return response.status(404).json({ error : 'User not found.' });
        }

        const emailTaken = await query(
            `SELECT id FROM users WHERE email = ? AND id <> ?`,
            [new_email , userId]
        );
        if( emailTaken.length > 0 ){
            return response.status(409).json({ error : 'Email already in use.' });
        }

        const isValidPassword = await bcrypt.compare(current_password , users[0].password_hash);
        if( !isValidPassword ){
            return response.status(401).json({ error : 'Current password is incorrect.' });
        }

        await query(`UPDATE users SET email = ? WHERE id = ?`, [new_email, userId]);
        request.session.email = new_email;

        response.json({ message : 'Email updated successfully.' });
    }catch( error ){
        console.error(`Error updating email: ${error.message}`);
        response.status(500).json({ error : 'Failed to update email.' });
    }
});

/* PATCH /api/account/password — secure password update */
router.patch('/password' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { current_password , new_password } = request.body;

        if( !current_password || !new_password ){
            return response.status(400).json({ error : 'current_password and new_password are required.' });
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
        if( !passwordRegex.test(new_password) ){
            return response.status(400).json({
                error : 'New password must be at least 8 characters with uppercase, lowercase, number and special character.'
            });
        }

        const users = await query(`SELECT password_hash FROM users WHERE id = ?`, [userId]);
        if( users.length === 0 ){
            return response.status(404).json({ error : 'User not found.' });
        }

        const isValidPassword = await bcrypt.compare(current_password , users[0].password_hash);
        if( !isValidPassword ){
            return response.status(401).json({ error : 'Current password is incorrect.' });
        }

        const passwordHash = await bcrypt.hash(new_password , 10);
        await query(`UPDATE users SET password_hash = ? WHERE id = ?`, [passwordHash, userId]);

        response.json({ message : 'Password updated successfully.' });
    }catch( error ){
        console.error(`Error updating password: ${error.message}`);
        response.status(500).json({ error : 'Failed to update password.' });
    }
});

/* DELETE /api/account — GDPR right to erasure */
router.delete('/' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { current_password } = request.body;

        if( !current_password ){
            return response.status(400).json({ error : 'current_password is required.' });
        }

        const users = await query(
            `SELECT password_hash FROM users WHERE id = ?`,
            [userId]
        );
        if( users.length === 0 ){
            return response.status(404).json({ error : 'User not found.' });
        }

        const isValidPassword = await bcrypt.compare(current_password , users[0].password_hash);
        if( !isValidPassword ){
            return response.status(401).json({ error : 'Current password is incorrect.' });
        }

        await query(`DELETE FROM users WHERE id = ?`, [userId]);

        request.session.destroy((error) => {
            if( error ){
                console.error(`Session destroy failed: ${error.message}`);
                return response.status(500).json({ error : 'Failed to end session.' });
            }
            response.json({ message : 'Account deleted successfully.' });
        });
    }catch( error ){
        console.error(`Error deleting account: ${error.message}`);
        response.status(500).json({ error : 'Failed to delete account.' });
    }
});

export default router;
