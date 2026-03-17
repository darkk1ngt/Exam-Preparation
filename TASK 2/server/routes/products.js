import express from 'express';
import { query } from '../database/connection.js';

const router = express.Router();

// GET /
router.get('/', async (req, res) => {
    const { category, search, page = 1, limit = 12 } = req.query;
    
    try {
        let sql = 'SELECT * FROM products WHERE is_available = TRUE';
        const params = [];

        if (category && category !== 'all') {
            sql += ' AND category = ?';
            params.push(category);
        }

        if (search) {
            sql += ' AND (name LIKE ? OR description LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // Get total count
        const countSql = sql.replace('SELECT *', 'SELECT COUNT(*) as total');
        const countResult = await query(countSql, params);
        const total = countResult[0].total;

        // Add pagination
        const offset = (page - 1) * limit;
        sql += ' LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);

        const products = await query(sql, params);

        return res.json({
            products,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                pages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Get products error:', error);
        return res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// GET /:id
router.get('/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const products = await query(
            `SELECT p.*, u.farm_name, u.email FROM products p 
             LEFT JOIN users u ON p.producer_id = u.id 
             WHERE p.id = ?`,
            [id]
        );

        if (products.length === 0) {
            return res.status(404).json({ error: 'Product not found' });
        }

        return res.json(products[0]);
    } catch (error) {
        console.error('Get product error:', error);
        return res.status(500).json({ error: 'Failed to fetch product' });
    }
});

export default router;
