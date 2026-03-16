import express from 'express';
import { query } from '../database/connection.js';
import { requireAuth , requireAdmin } from '../utils/middleware.js';
import { optionalAuth } from '../utils/middleware.js';

const router = express.Router();

/* Get all available collection slots */
router.get('/' , optionalAuth , async( request , response )=>{
    try{
        const { date } = request.query;

        const isAdmin = request.userRole === 'admin';

        let sql = `SELECT id , slot_date , slot_time , max_capacity , current_bookings ,
                   (max_capacity - current_bookings) AS remaining_capacity , is_available
                   FROM collection_slots WHERE 1 = 1`;
        const params = [];

        if( !isAdmin ){
            sql += ' AND is_available = TRUE';
        }

        if( date ){
            sql += ' AND slot_date = ?';
            params.push(date);
        }else{
            sql += ' AND slot_date >= CURDATE()';
        }

        sql += ' ORDER BY slot_date ASC, slot_time ASC';

        const slots = await query(sql, params);
        response.json({ slots });
    }catch( error ){
        console.error(`Error fetching slots: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch slots.' });
    }
});

/* Get a specific slot by id */
router.get('/:id' , async( request , response )=>{
    try{
        const { id } = request.params;

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid slot ID.' });
        }

        const slots = await query(
            `SELECT id , slot_date , slot_time , max_capacity , current_bookings ,
             (max_capacity - current_bookings) AS remaining_capacity , is_available
             FROM collection_slots WHERE id = ?`,
            [id]
        );

        if( slots.length === 0 ){
            return response.status(404).json({ error : 'Slot not found.' });
        }

        response.json({ slot : slots[0] });
    }catch( error ){
        console.error(`Error fetching slot: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch slot.' });
    }
});

/* Admin: Create a new collection slot */
router.post('/' , requireAuth , requireAdmin , async( request , response )=>{
    try{
        const { slot_date , slot_time , max_capacity } = request.body;

        if( !slot_date || !slot_time ){
            return response.status(400).json({ error : 'slot_date and slot_time are required.' });
        }

        if( max_capacity !== undefined && (isNaN(max_capacity) || max_capacity < 1) ){
            return response.status(400).json({ error : 'max_capacity must be a positive number.' });
        }

        const result = await query(
            `INSERT INTO collection_slots (slot_date , slot_time , max_capacity)
             VALUES (? , ? , ?)`,
            [slot_date , slot_time , max_capacity ?? 10]
        );

        const slot = await query(
            `SELECT * FROM collection_slots WHERE id = ?`,
            [result.insertId]
        );

        response.status(201).json({ message : 'Slot created.', slot : slot[0] });
    }catch( error ){
        if( error.code === 'ER_DUP_ENTRY' ){
            return response.status(409).json({ error : 'A slot already exists for that date and time.' });
        }
        console.error(`Error creating slot: ${error.message}`);
        response.status(500).json({ error : 'Failed to create slot.' });
    }
});

/* Admin: Update a slot (toggle availability or change capacity) */
router.patch('/:id' , requireAuth , requireAdmin , async( request , response )=>{
    try{
        const { id } = request.params;
        const { max_capacity , is_available } = request.body;

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid slot ID.' });
        }

        const updateFields = [];
        const updateValues = [];

        if( max_capacity !== undefined ){
            if( isNaN(max_capacity) || max_capacity < 1 ){
                return response.status(400).json({ error : 'max_capacity must be a positive number.' });
            }
            updateFields.push('max_capacity = ?');
            updateValues.push(max_capacity);
        }

        if( is_available !== undefined ){
            if( typeof is_available !== 'boolean' ){
                return response.status(400).json({ error : 'is_available must be boolean.' });
            }
            updateFields.push('is_available = ?');
            updateValues.push(is_available);
        }

        if( updateFields.length === 0 ){
            return response.status(400).json({ error : 'No valid fields to update.' });
        }

        updateValues.push(id);
        await query(
            `UPDATE collection_slots SET ${updateFields.join(', ')} WHERE id = ?`,
            updateValues
        );

        const updated = await query(`SELECT * FROM collection_slots WHERE id = ?`, [id]);
        if( updated.length === 0 ){
            return response.status(404).json({ error : 'Slot not found.' });
        }

        response.json({ message : 'Slot updated.', slot : updated[0] });
    }catch( error ){
        console.error(`Error updating slot: ${error.message}`);
        response.status(500).json({ error : 'Failed to update slot.' });
    }
});

/* Admin: Delete a slot */
router.delete('/:id' , requireAuth , requireAdmin , async( request , response )=>{
    try{
        const { id } = request.params;

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid slot ID.' });
        }

        const result = await query(
            `DELETE FROM collection_slots WHERE id = ?`,
            [id]
        );

        if( result.affectedRows === 0 ){
            return response.status(404).json({ error : 'Slot not found.' });
        }

        response.json({ message : 'Slot deleted.' });
    }catch( error ){
        console.error(`Error deleting slot: ${error.message}`);
        response.status(500).json({ error : 'Failed to delete slot.' });
    }
});

export default router;