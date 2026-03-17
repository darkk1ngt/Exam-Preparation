import express from 'express';
import nodemailer from 'nodemailer';
import { query } from '../database/connection.js';

const router = express.Router();

// Middleware: require admin
const requireAdmin = (req, res, next) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

router.use(requireAdmin);

// Email configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    }
});

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log(`[Email would be sent to ${to}] ${subject}`);
            return true;
        }
        await transporter.sendMail({ from: process.env.EMAIL_USER, to, subject, html });
        return true;
    } catch (error) {
        console.error('Email error:', error);
        return false;
    }
};

// GET /producers - pending producers
router.get('/producers', async (req, res) => {
    try {
        const producers = await query(
            'SELECT id, email, farm_name, contact_number, producer_status FROM users WHERE producer_status = "pending"'
        );
        return res.json({ producers });
    } catch (error) {
        console.error('Get producers error:', error);
        return res.status(500).json({ error: 'Failed to fetch producers' });
    }
});

// PUT /producers/:id/approve
router.put('/producers/:id/approve', async (req, res) => {
    const { id } = req.params;

    try {
        const producers = await query(
            'SELECT email, farm_name FROM users WHERE id = ? AND producer_status = "pending"',
            [id]
        );

        if (producers.length === 0) {
            return res.status(404).json({ error: 'Producer not found or already processed' });
        }

        const producer = producers[0];

        await query('UPDATE users SET producer_status = "approved" WHERE id = ?', [id]);

        await sendEmail(
            producer.email,
            'Producer Account Approved',
            `<p>Congratulations! Your producer account for ${producer.farm_name} has been approved.</p>`
        );

        return res.json({ message: 'Producer approved' });
    } catch (error) {
        console.error('Approve producer error:', error);
        return res.status(500).json({ error: 'Failed to approve producer' });
    }
});

// PUT /producers/:id/reject
router.put('/producers/:id/reject', async (req, res) => {
    const { id } = req.params;

    try {
        const producers = await query(
            'SELECT email, farm_name FROM users WHERE id = ? AND producer_status = "pending"',
            [id]
        );

        if (producers.length === 0) {
            return res.status(404).json({ error: 'Producer not found or already processed' });
        }

        const producer = producers[0];

        await query('UPDATE users SET producer_status = "rejected" WHERE id = ?', [id]);

        await sendEmail(
            producer.email,
            'Producer Account Rejected',
            `<p>Unfortunately, your producer account for ${producer.farm_name} could not be approved at this time.</p>`
        );

        return res.json({ message: 'Producer rejected' });
    } catch (error) {
        console.error('Reject producer error:', error);
        return res.status(500).json({ error: 'Failed to reject producer' });
    }
});

// GET /slots
router.get('/slots', async (req, res) => {
    try {
        const slots = await query(
            'SELECT * FROM collection_slots ORDER BY slot_date ASC, slot_time ASC'
        );
        return res.json({ slots });
    } catch (error) {
        console.error('Get slots error:', error);
        return res.status(500).json({ error: 'Failed to fetch slots' });
    }
});

// POST /slots
router.post('/slots', async (req, res) => {
    const { slot_date, slot_time, max_capacity } = req.body;

    if (!slot_date || !slot_time || !max_capacity) {
        return res.status(400).json({ error: 'slot_date, slot_time, and max_capacity required' });
    }

    try {
        const result = await query(
            'INSERT INTO collection_slots (slot_date, slot_time, max_capacity, current_bookings, is_available) VALUES (?, ?, ?, 0, TRUE)',
            [slot_date, slot_time, max_capacity]
        );
        return res.status(201).json({ slotId: result.insertId });
    } catch (error) {
        console.error('Create slot error:', error);
        return res.status(500).json({ error: 'Failed to create slot' });
    }
});

// PUT /slots/:id
router.put('/slots/:id', async (req, res) => {
    const { id } = req.params;
    const { max_capacity, is_available } = req.body;

    try {
        const updates = [];
        const values = [];

        if (max_capacity !== undefined) {
            updates.push('max_capacity = ?');
            values.push(max_capacity);
        }
        if (is_available !== undefined) {
            updates.push('is_available = ?');
            values.push(is_available);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(id);
        await query(`UPDATE collection_slots SET ${updates.join(', ')} WHERE id = ?`, values);

        return res.json({ message: 'Slot updated' });
    } catch (error) {
        console.error('Update slot error:', error);
        return res.status(500).json({ error: 'Failed to update slot' });
    }
});

// DELETE /slots/:id
router.delete('/slots/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const result = await query('DELETE FROM collection_slots WHERE id = ?', [id]);

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Slot not found' });
        }

        return res.json({ message: 'Slot deleted' });
    } catch (error) {
        console.error('Delete slot error:', error);
        return res.status(500).json({ error: 'Failed to delete slot' });
    }
});

export default router;
