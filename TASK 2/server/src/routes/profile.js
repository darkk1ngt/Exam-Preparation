import express from 'express';
import bcrypt from 'bcryptjs';
import { query } from '../database/connection.js';
import { requireAuth } from '../utils/middleware.js';

const router = express.Router();

router.use(requireAuth);

// GET /
router.get('/', async (req, res) => {
    try {
        const users = await query('SELECT id, email, role, farm_name, contact_number FROM users WHERE id = ?', [req.session.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        return res.json(users[0]);
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ error: 'Failed to fetch profile' });
    }
});

// PUT /
router.put('/', async (req, res) => {
    const { email, farm_name, contact_number } = req.body;

    try {
        // Check if email is unique (if changing)
        if (email && email !== req.session.user.email) {
            const existing = await query('SELECT id FROM users WHERE email = ? AND id != ?', [email, req.session.user.id]);
            if (existing.length > 0) {
                return res.status(409).json({ error: 'Email already in use' });
            }
        }

        const updates = [];
        const values = [];

        if (email) {
            updates.push('email = ?');
            values.push(email);
        }
        if (farm_name !== undefined) {
            updates.push('farm_name = ?');
            values.push(farm_name || null);
        }
        if (contact_number !== undefined) {
            updates.push('contact_number = ?');
            values.push(contact_number || null);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No fields to update' });
        }

        values.push(req.session.user.id);
        
        await query(`UPDATE users SET ${updates.join(', ')} WHERE id = ?`, values);

        // Update session
        if (email) req.session.user.email = email;
        if (farm_name !== undefined) req.session.user.farm_name = farm_name;
        if (contact_number !== undefined) req.session.user.contact_number = contact_number;

        return res.json({ message: 'Profile updated', user: req.session.user });
    } catch (error) {
        console.error('Update profile error:', error);
        return res.status(500).json({ error: 'Failed to update profile' });
    }
});

// PUT /password
router.put('/password', async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'currentPassword and newPassword required' });
    }

    try {
        const users = await query('SELECT password_hash FROM users WHERE id = ?', [req.session.user.id]);
        if (users.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const user = users[0];
        const match = await bcrypt.compare(currentPassword, user.password_hash);
        if (!match) {
            return res.status(401).json({ error: 'Current password incorrect' });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await query('UPDATE users SET password_hash = ? WHERE id = ?', [newHash, req.session.user.id]);

        return res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Update password error:', error);
        return res.status(500).json({ error: 'Failed to update password' });
    }
});

// DELETE /
router.delete('/', async (req, res) => {
    try {
        await query('DELETE FROM users WHERE id = ?', [req.session.user.id]);
        req.session.destroy((err) => {
            if (err) return res.status(500).json({ error: 'Delete failed' });
            return res.json({ message: 'Account deleted successfully' });
        });
    } catch (error) {
        console.error('Delete account error:', error);
        return res.status(500).json({ error: 'Failed to delete account' });
    }
});

export default router;
