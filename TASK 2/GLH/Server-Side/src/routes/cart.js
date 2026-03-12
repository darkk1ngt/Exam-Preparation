import express from 'express';
import { query } from '../database/connection.js';
import { requireAuth } from '../utils/middleware.js';

const router = express.Router();

/* GET /api/cart — get current user's cart */
router.get('/' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;

        const items = await query(
            `SELECT ci.id , ci.product_id , ci.quantity ,
             p.name , p.price , p.image_url , p.stock_quantity , p.is_available ,
             (ci.quantity * p.price) AS line_total
             FROM cart_items ci
             JOIN products p ON ci.product_id = p.id
             WHERE ci.customer_id = ?`,
            [userId]
        );

        const total = items.reduce((sum , item) => sum + parseFloat(item.line_total) , 0);

        response.json({ items , total : total.toFixed(2) });
    }catch( error ){
        console.error(`Error fetching cart: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch cart.' });
    }
});

/* POST /api/cart — add or update an item in the cart */
router.post('/' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { product_id , quantity } = request.body;

        if( !product_id ){
            return response.status(400).json({ error : 'product_id is required.' });
        }

        const qty = parseInt(quantity) || 1;
        if( qty < 1 ){
            return response.status(400).json({ error : 'quantity must be at least 1.' });
        }

        /* Check product exists and has enough stock */
        const products = await query(
            `SELECT id , stock_quantity , is_available FROM products WHERE id = ?`,
            [product_id]
        );

        if( products.length === 0 ){
            return response.status(404).json({ error : 'Product not found.' });
        }

        const product = products[0];
        if( !product.is_available || product.stock_quantity === 0 ){
            return response.status(409).json({ error : 'Product is not available.' });
        }

        if( qty > product.stock_quantity ){
            return response.status(409).json({ error : `Only ${product.stock_quantity} units available.` });
        }

        /* Upsert */
        await query(
            `INSERT INTO cart_items (customer_id , product_id , quantity)
             VALUES (? , ? , ?)
             ON DUPLICATE KEY UPDATE quantity = ?`,
            [userId , product_id , qty , qty]
        );

        response.status(201).json({ message : 'Cart updated.' });
    }catch( error ){
        console.error(`Error updating cart: ${error.message}`);
        response.status(500).json({ error : 'Failed to update cart.' });
    }
});

/* PATCH /api/cart/:productId — update quantity of a cart item */
router.patch('/:productId' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { productId } = request.params;
        const { quantity } = request.body;

        if( isNaN(productId) ){
            return response.status(400).json({ error : 'Invalid product ID.' });
        }

        const qty = parseInt(quantity);
        if( isNaN(qty) || qty < 1 ){
            return response.status(400).json({ error : 'quantity must be at least 1.' });
        }

        const products = await query(
            `SELECT stock_quantity FROM products WHERE id = ?`,
            [productId]
        );

        if( products.length === 0 ){
            return response.status(404).json({ error : 'Product not found.' });
        }

        if( qty > products[0].stock_quantity ){
            return response.status(409).json({ error : `Only ${products[0].stock_quantity} units available.` });
        }

        const result = await query(
            `UPDATE cart_items SET quantity = ? WHERE customer_id = ? AND product_id = ?`,
            [qty , userId , productId]
        );

        if( result.affectedRows === 0 ){
            return response.status(404).json({ error : 'Cart item not found.' });
        }

        response.json({ message : 'Cart item updated.' });
    }catch( error ){
        console.error(`Error updating cart item: ${error.message}`);
        response.status(500).json({ error : 'Failed to update cart item.' });
    }
});

/* DELETE /api/cart/:productId — remove a specific item from cart */
router.delete('/:productId' , requireAuth , async( request , response )=>{
    try{
        const userId = request.userId;
        const { productId } = request.params;

        if( isNaN(productId) ){
            return response.status(400).json({ error : 'Invalid product ID.' });
        }

        const result = await query(
            `DELETE FROM cart_items WHERE customer_id = ? AND product_id = ?`,
            [userId , productId]
        );

        if( result.affectedRows === 0 ){
            return response.status(404).json({ error : 'Cart item not found.' });
        }

        response.json({ message : 'Item removed from cart.' });
    }catch( error ){
        console.error(`Error removing cart item: ${error.message}`);
        response.status(500).json({ error : 'Failed to remove item.' });
    }
});

/* DELETE /api/cart — clear entire cart */
router.delete('/' , requireAuth , async( request , response )=>{
    try{
        await query(`DELETE FROM cart_items WHERE customer_id = ?` , [request.userId]);
        response.json({ message : 'Cart cleared.' });
    }catch( error ){
        console.error(`Error clearing cart: ${error.message}`);
        response.status(500).json({ error : 'Failed to clear cart.' });
    }
});

export default router;