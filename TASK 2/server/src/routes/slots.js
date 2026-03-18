import express from 'express';
import { query } from '../database/connection.js';

const router = express.Router();

// GET / - available slots with optional date filter
router.get('/', async (req, res) => {
    const { date } = req.query;

    try {
        let sql = 'SELECT * FROM collection_slots WHERE is_available = TRUE';
        const params = [];

        if (date) {
            sql += ' AND slot_date = ?';
            params.push(date);
        }

        sql += ' ORDER BY slot_date ASC, slot_time ASC';

        const slots = await query(sql, params);
        return res.json({ slots });
    } catch (error) {
        console.error('Get slots error:', error);
        return res.status(500).json({ error: 'Failed to fetch slots' });
    }
});

export default router;
