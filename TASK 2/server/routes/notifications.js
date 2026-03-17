import express from 'express';
import { query } from '../database/connection.js';

const router = express.Router();

// Middleware: require auth
const requireAuth = (req, res, next) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    next();
};

router.use(requireAuth);

// GET /
router.get('/', async (req, res) => {
    try {
        const notifications = await query(
            'SELECT * FROM notifications WHERE customer_id = ? ORDER BY created_at DESC',
            [req.session.user.id]
        );
        return res.json({ notifications });
    } catch (error) {
        console.error('Get notifications error:', error);
        return res.status(500).json({ error: 'Failed to fetch notifications' });
    }
});

// PUT /:id/read
router.put('/:id/read', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query(
            'UPDATE notifications SET is_read = TRUE WHERE id = ? AND customer_id = ?',
            [id, req.session.user.id]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Notification not found' });
        }

        return res.json({ message: 'Notification marked as read' });
    } catch (error) {
        console.error('Mark read error:', error);
        return res.status(500).json({ error: 'Failed to update notification' });
    }
});

// PUT /read-all
router.put('/read-all', async (req, res) => {
    try {
        await query(
            'UPDATE notifications SET is_read = TRUE WHERE customer_id = ?',
            [req.session.user.id]
        );
        return res.json({ message: 'All notifications marked as read' });
    } catch (error) {
        console.error('Mark all read error:', error);
        return res.status(500).json({ error: 'Failed to update notifications' });
    }
});

export default router;
