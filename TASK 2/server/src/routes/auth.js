
import express from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { query } from '../database/connection.js';
import { isValidEmail, isValidPassword, isValidUkPhone, normalizeUkPhone, sendEmail } from '../utils/index.js';

const router = express.Router();

// POST /register
router.post('/register', async (req, res) => {
    const { email, password, role, farm_name, contact_number } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ error: 'email, password, and role required' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    if (!isValidPassword(password)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters and contain uppercase, lowercase, a number, and a special character' });
    }

    if (!['customer', 'producer'].includes(role)) {
        return res.status(400).json({ error: 'role must be customer or producer' });
    }

    if (role === 'producer' && (!farm_name || !contact_number)) {
        return res.status(400).json({ error: 'farm_name and contact_number are required for producers' });
    }

    const trimmedFarmName = typeof farm_name === 'string' ? farm_name.trim() : '';
    const normalizedContactNumber = normalizeUkPhone(contact_number);

    if (role === 'producer' && !trimmedFarmName) {
        return res.status(400).json({ error: 'farm_name is required for producers' });
    }

    if (role === 'producer' && !isValidUkPhone(contact_number)) {
        return res.status(400).json({ error: 'Invalid UK contact_number format' });
    }

    try {
        // Check if user exists
        const existing = await query('SELECT id, role, email_verified FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            const existingUser = existing[0];

            if (existingUser.email_verified) {
                return res.status(409).json({ error: 'Email already registered' });
            }

            if (existingUser.role !== role) {
                return res.status(409).json({ error: 'Unverified account already exists with a different role' });
            }

            // Re-register unverified account by rotating password + verification token
            const passwordHash = await bcrypt.hash(password, 10);
            const emailVerifyToken = crypto.randomBytes(32).toString('hex');
            const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

            await query(
                `UPDATE users
                 SET password_hash = ?,
                     farm_name = ?,
                     contact_number = ?,
                     producer_status = ?,
                     email_verify_token = ?
                 WHERE id = ?`,
                [
                    passwordHash,
                    role === 'producer' ? trimmedFarmName : null,
                    role === 'producer' ? normalizedContactNumber : null,
                    role === 'producer' ? 'pending' : null,
                    emailVerifyToken,
                    existingUser.id
                ]
            );

            if (role === 'customer') {
                await query(
                    `INSERT INTO loyalty (customer_id, points_balance, discount_threshold, points_rate)
                     VALUES (?, 0, 100, 1.00)
                     ON DUPLICATE KEY UPDATE customer_id = customer_id`,
                    [existingUser.id]
                );
            }

            const verifyLink = `${frontendUrl}/verify-email?token=${emailVerifyToken}`;
            await sendEmail(
                email,
                'Verify your email',
                `<p>Click <a href="${verifyLink}">here</a> to verify your email.</p>`
            );

            console.log(`\n  EMAIL TOKEN ROTATED FOR ${email}:`);
            console.log(` Verification Link: ${verifyLink}\n`);

            return res.status(200).json({
                message: 'Account exists but is not verified. A new verification link has been sent.',
                userId: existingUser.id,
                verifyToken: emailVerifyToken
            });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Generate email verify token
        const emailVerifyToken = crypto.randomBytes(32).toString('hex');

        // Insert user
        const insertResult = await query(
            `INSERT INTO users (email, password_hash, role, farm_name, contact_number, email_verify_token, producer_status)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                email,
                passwordHash,
                role,
                role === 'producer' ? trimmedFarmName : null,
                role === 'producer' ? normalizedContactNumber : null,
                emailVerifyToken,
                role === 'producer' ? 'pending' : null
            ]
        );

        const userId = insertResult.insertId;

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

        // Log verification link to console (development)
        console.log(`\n  EMAIL TOKEN FOR ${email}:`);
        console.log(` Verification Link: ${frontendUrl}/verify-email?token=${emailVerifyToken}\n`);

        // Create loyalty record for customers
        if (role === 'customer') {
            await query('INSERT INTO loyalty (customer_id, points_balance, discount_threshold, points_rate) VALUES (?, 0, 100, 1.00)', [userId]);
        }

        // Send verification email
        const verifyLink = `${frontendUrl}/verify-email?token=${emailVerifyToken}`;
        await sendEmail(
            email,
            'Verify your email',
            `<p>Click <a href="${verifyLink}">here</a> to verify your email.</p>`
        );

        return res.status(201).json({
            message: 'Registration successful. Check your email to verify.',
            userId,
            verifyToken: emailVerifyToken
        });
    } catch (error) {
        console.error('Register error:', error);
        return res.status(500).json({ error: 'Registration failed' });
    }
});

// POST /login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: 'email and password required' });
    }

    try {
        const users = await query('SELECT * FROM users WHERE email = ?', [email]);
        if (users.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = users[0];
        const passwordMatch = await bcrypt.compare(password, user.password_hash);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Verify email and producer status
        if (!user.email_verified) {
            return res.status(403).json({ error: 'Please verify your email first' });
        }

        if (user.role === 'producer' && user.producer_status !== 'approved') {
            return res.status(403).json({ error: 'Your producer account is not yet approved' });
        }

        // Set session
        req.session.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            email_verified: !!user.email_verified,
            farm_name: user.farm_name,
            contact_number: user.contact_number,
            producer_status: user.producer_status
        };

        return res.json({
            message: 'Login successful',
            user: req.session.user
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ error: 'Login failed' });
    }
});

// GET /verify-email?token=
router.get('/verify-email', async (req, res) => {
    const { token } = req.query;

    if (!token) {
        return res.status(400).json({ error: 'token required' });
    }

    try {
        const userResult = await query(
            'SELECT id FROM users WHERE email_verify_token = ?',
            [token]
        );

        if (userResult.length === 0) {
            return res.status(404).json({ error: 'Invalid or expired token' });
        }

        const userId = userResult[0].id;

        // Update user
        await query(
            'UPDATE users SET email_verified = TRUE, email_verify_token = NULL WHERE id = ?',
            [userId]
        );

        return res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verify email error:', error);
        return res.status(500).json({ error: 'Verification failed' });
    }
});

// POST /resend-verification
router.post('/resend-verification', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'email required' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
    }

    try {
        const users = await query(
            'SELECT id, email_verified FROM users WHERE email = ? LIMIT 1',
            [email]
        );

        if (users.length === 0) {
            // Keep response generic to avoid email enumeration
            return res.json({ message: 'If your account exists, a verification email has been sent.' });
        }

        const user = users[0];
        if (user.email_verified) {
            return res.json({ message: 'Email already verified. You can log in now.' });
        }

        const emailVerifyToken = crypto.randomBytes(32).toString('hex');
        await query('UPDATE users SET email_verify_token = ? WHERE id = ?', [emailVerifyToken, user.id]);

        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const verifyLink = `${frontendUrl}/verify-email?token=${emailVerifyToken}&email=${encodeURIComponent(email)}`;

        await sendEmail(
            email,
            'Verify your email',
            `<p>Click <a href="${verifyLink}">here</a> to verify your email.</p>`
        );

        console.log(`\n  RESENT EMAIL TOKEN FOR ${email}:`);
        console.log(` Verification Link: ${verifyLink}\n`);

        return res.json({
            message: 'Verification email resent. Please check your inbox.',
            verifyToken: emailVerifyToken
        });
    } catch (error) {
        console.error('Resend verification error:', error);
        return res.status(500).json({ error: 'Failed to resend verification email' });
    }
});

// POST /forgot-password
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ error: 'email required' });
    }

    try {
        const userResult = await query('SELECT id FROM users WHERE email = ?', [email]);
        if (userResult.length === 0) {
            // Don't reveal if email exists
            return res.json({ message: 'If email exists, reset link has been sent' });
        }

        const userId = userResult[0].id;
        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

        await query(
            'UPDATE users SET reset_token = ?, reset_token_expiry = ? WHERE id = ?',
            [resetToken, resetExpiry, userId]
        );

        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
        await sendEmail(
            email,
            'Reset your password',
            `<p>Click <a href="${resetLink}">here</a> to reset your password. Link expires in 24 hours.</p>`
        );

        return res.json({ message: 'If email exists, reset link has been sent' });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ error: 'Failed to process request' });
    }
});

// POST /reset-password
router.post('/reset-password', async (req, res) => {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        return res.status(400).json({ error: 'token and newPassword required' });
    }

    if (!isValidPassword(newPassword)) {
        return res.status(400).json({ error: 'Password must be at least 8 characters and contain uppercase, lowercase, a number, and a special character' });
    }

    try {
        const userResult = await query(
            'SELECT id, reset_token_expiry FROM users WHERE reset_token = ?',
            [token]
        );

        if (userResult.length === 0) {
            return res.status(404).json({ error: 'Invalid token' });
        }

        const user = userResult[0];
        
        // Check expiry
        if (new Date(user.reset_token_expiry) < new Date()) {
            return res.status(400).json({ error: 'Token expired' });
        }

        // Hash new password
        const passwordHash = await bcrypt.hash(newPassword, 10);

        // Update password and clear token
        await query(
            'UPDATE users SET password_hash = ?, reset_token = NULL, reset_token_expiry = NULL WHERE id = ?',
            [passwordHash, user.id]
        );

        return res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ error: 'Password reset failed' });
    }
});

// GET /me
router.get('/me', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Not authenticated' });
    }
    return res.json(req.session.user);
});

// POST /logout
router.post('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ error: 'Logout failed' });
        }
        return res.json({ message: 'Logged out successfully' });
    });
});

export default router;


