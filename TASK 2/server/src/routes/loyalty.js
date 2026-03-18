import express from 'express';
import { query } from '../database/connection.js';
import { requireAuth } from '../utils/middleware.js';

const router = express.Router();

router.use(requireAuth);

// GET /
router.get('/', async (req, res) => {
    try {
        let loyalty = await query('SELECT * FROM loyalty WHERE customer_id = ?', [req.session.user.id]);

        if (loyalty.length === 0) {
            // Auto-initialize if missing
            await query(
                'INSERT INTO loyalty (customer_id, points_balance, discount_threshold, points_rate) VALUES (?, 0, 100, 1.00)',
                [req.session.user.id]
            );
            loyalty = await query('SELECT * FROM loyalty WHERE customer_id = ?', [req.session.user.id]);
        }

        return res.json(loyalty[0]);
    } catch (error) {
        console.error('Get loyalty error:', error);
        return res.status(500).json({ error: 'Failed to fetch loyalty' });
    }
});

export default router;

