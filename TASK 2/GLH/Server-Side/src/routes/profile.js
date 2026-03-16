import express from 'express';
import bcrypt from 'bcrypt';
import { query } from '../database/connection.js';
import { requireAuth } from '../utils/middleware.js';

const router = express.Router();

/* GET /api/profile — get current user's profile */
router.get('/' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;

        const users = await query(
            `SELECT id , email , role , farm_name , contact_number ,
             email_verified , producer_status , created_at , updated_at
             FROM users WHERE id = ?`,
            [userId]
        );

        if( users.length === 0 ){
            return response.status(404).json({ error : 'User not found.' });
        }

        const loyalty = await query(
            `SELECT points_balance , discount_active , discount_value FROM loyalty WHERE customer_id = ?`,
            [userId]
        );

        response.json({
            user : users[0],
            loyalty : loyalty.length > 0 ? loyalty[0] : null
        });
    }catch( error ){
        console.error(`Error fetching profile: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch profile.' });
    }
});

/* PATCH /api/profile — update profile fields */
router.patch('/' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { farm_name , contact_number } = request.body;

        const updateFields = [];
        const updateValues = [];

        if( farm_name !== undefined ){
            updateFields.push('farm_name = ?');
            updateValues.push(farm_name);
        }

        if( contact_number !== undefined ){
            updateFields.push('contact_number = ?');
            updateValues.push(contact_number);
        }

        if( updateFields.length === 0 ){
            return response.status(400).json({ error : 'No valid fields to update.' });
        }

        updateValues.push(userId);
        await query(
            `UPDATE users SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        const updated = await query(
            `SELECT id , email , role , farm_name , contact_number ,
             email_verified , producer_status , created_at , updated_at
             FROM users WHERE id = ?`,
            [userId]
        );

        request.session.farm_name = updated[0].farm_name;
        request.session.contact_number = updated[0].contact_number;
        request.session.email_verified = Boolean(updated[0].email_verified);
        request.session.producer_status = updated[0].producer_status;

        response.json({ message : 'Profile updated.', user : updated[0] });
    }catch( error ){
        console.error(`Error updating profile: ${error.message}`);
        response.status(500).json({ error : 'Failed to update profile.' });
    }
});

/* PATCH /api/profile/password — change password */
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

        const users = await query(
            `SELECT password_hash FROM users WHERE id = ?`,
            [userId]
        );

        if( users.length === 0 ){
            return response.status(404).json({ error : 'User not found.' });
        }

        const isValid = await bcrypt.compare(current_password , users[0].password_hash);
        if( !isValid ){
            return response.status(401).json({ error : 'Current password is incorrect.' });
        }

        const newHash = await bcrypt.hash(new_password , 10);
        await query(
            `UPDATE users SET password_hash = ? WHERE id = ?`,
            [newHash , userId]
        );

        response.json({ message : 'Password updated successfully.' });
    }catch( error ){
        console.error(`Error changing password: ${error.message}`);
        response.status(500).json({ error : 'Failed to change password.' });
    }
});

export default router;