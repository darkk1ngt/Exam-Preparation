import express from 'express';
import { query } from '../database/connection.js';
import { requireAuth , requireAdmin } from '../utils/middleware.js';

const router = express.Router();

/* Get loyalty status for the logged-in customer */
router.get('/' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;

        const rows = await query(
            `SELECT points_balance , discount_threshold , discount_active , discount_value , points_rate , created_at , updated_at
             FROM loyalty WHERE customer_id = ?`,
            [userId]
        );

        if( rows.length === 0 ){
            /* Auto-create a loyalty record for new customers */
            await query(
                `INSERT INTO loyalty (customer_id) VALUES (?)`,
                [userId]
            );
            return response.json({
                loyalty : {
                    points_balance : 0,
                    discount_threshold : 100,
                    discount_active : false,
                    discount_value : 10.00,
                    points_rate : 1.00
                }
            });
        }

        response.json({ loyalty : rows[0] });
    }catch( error ){
        console.error(`Error fetching loyalty: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch loyalty data.' });
    }
});

/* Admin: Get loyalty status for any customer */
router.get('/:customerId' , requireAuth , requireAdmin , async( request , response )=>{
    try{
        const { customerId } = request.params;

        if( isNaN(customerId) ){
            return response.status(400).json({ error : 'Invalid customer ID.' });
        }

        const rows = await query(
            `SELECT l.* , u.email FROM loyalty l
             JOIN users u ON l.customer_id = u.id
             WHERE l.customer_id = ?`,
            [customerId]
        );

        if( rows.length === 0 ){
            return response.status(404).json({ error : 'Loyalty record not found.' });
        }

        response.json({ loyalty : rows[0] });
    }catch( error ){
        console.error(`Error fetching loyalty: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch loyalty data.' });
    }
});

/* Admin: Manually adjust loyalty points */
router.patch('/:customerId' , requireAuth , requireAdmin , async( request , response )=>{
    try{
        const { customerId } = request.params;
        const { points_balance , discount_active } = request.body;

        if( isNaN(customerId) ){
            return response.status(400).json({ error : 'Invalid customer ID.' });
        }

        const updateFields = [];
        const updateValues = [];

        if( points_balance !== undefined ){
            if( isNaN(points_balance) || points_balance < 0 ){
                return response.status(400).json({ error : 'points_balance must be a non-negative number.' });
            }
            updateFields.push('points_balance = ?');
            updateValues.push(points_balance);
        }

        if( discount_active !== undefined ){
            if( typeof discount_active !== 'boolean' ){
                return response.status(400).json({ error : 'discount_active must be boolean.' });
            }
            updateFields.push('discount_active = ?');
            updateValues.push(discount_active);
        }

        if( updateFields.length === 0 ){
            return response.status(400).json({ error : 'No valid fields to update.' });
        }

        updateValues.push(customerId);
        await query(
            `UPDATE loyalty SET ${updateFields.join(' , ')} WHERE customer_id = ?`,
            updateValues
        );

        const updated = await query(
            `SELECT * FROM loyalty WHERE customer_id = ?`,
            [customerId]
        );

        response.json({ message : 'Loyalty updated.', loyalty : updated[0] });
    }catch( error ){
        console.error(`Error updating loyalty: ${error.message}`);
        response.status(500).json({ error : 'Failed to update loyalty.' });
    }
});

export default router;