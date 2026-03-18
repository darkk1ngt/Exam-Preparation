
import express from 'express';
import { query } from '../database/connection.js';
import { requireAuth } from '../utils/middleware.js';

const router = express.Router();

router.use(requireAuth);

// GET /
router.get('/', async (req, res) => {
    try {
        const items = await query(
            `SELECT c.id, c.product_id, c.quantity, p.name, p.price as unit_price, p.is_available, p.image_url, p.producer_id 
             FROM cart_items c 
             JOIN products p ON c.product_id = p.id 
             WHERE c.customer_id = ?`,
            [req.session.user.id]
        );
        return res.json({ items });
    } catch (error) {
        console.error('Get cart error:', error);
        return res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// POST /
router.post('/', async (req, res) => {
    const { productId, quantity = 1 } = req.body;

    if (!productId || quantity < 1) {
        return res.status(400).json({ error: 'Invalid productId or quantity' });
    }

    try {
        // Check product availability
        const products = await query('SELECT is_available FROM products WHERE id = ?', [productId]);
        if (products.length === 0 || !products[0].is_available) {
            return res.status(409).json({ error: 'Product not available' });
        }

        // INSERT ON DUPLICATE KEY UPDATE
        await query(
            `INSERT INTO cart_items (customer_id, product_id, quantity) VALUES (?, ?, ?)
             ON DUPLICATE KEY UPDATE quantity = quantity + ?`,
            [req.session.user.id, productId, quantity, quantity]
        );

        return res.json({ message: 'Item added to cart' });
    } catch (error) {
        console.error('Add to cart error:', error);
        return res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// PUT /:productId
router.put('/:productId', async (req, res) => {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (!quantity || quantity < 1) {
        return res.status(400).json({ error: 'Invalid quantity' });
    }

    try {
        const result = await query(
            'UPDATE cart_items SET quantity = ? WHERE customer_id = ? AND product_id = ?',
            [quantity, req.session.user.id, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        return res.json({ message: 'Quantity updated' });
    } catch (error) {
        console.error('Update cart error:', error);
        return res.status(500).json({ error: 'Failed to update cart' });
    }
});

// DELETE /:productId
router.delete('/:productId', async (req, res) => {
    const { productId } = req.params;

    try {
        const result = await query(
            'DELETE FROM cart_items WHERE customer_id = ? AND product_id = ?',
            [req.session.user.id, productId]
        );

        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Item not found in cart' });
        }

        return res.json({ message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        return res.status(500).json({ error: 'Failed to remove item' });
    }
});

// DELETE / (clear all)
router.delete('/', async (req, res) => {
    try {
        await query('DELETE FROM cart_items WHERE customer_id = ?', [req.session.user.id]);
        return res.json({ message: 'Cart cleared' });
    } catch (error) {
        console.error('Clear cart error:', error);
        return res.status(500).json({ error: 'Failed to clear cart' });
    }
});

export default router;