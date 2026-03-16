import express from 'express';
import { query } from '../database/connection.js';
import { requireAuth , requireProducer } from '../utils/middleware.js';
import { optionalAuth } from '../utils/middleware.js';

const router = express.Router();

/* GET /api/products — list all available products (public) */
router.get('/' , optionalAuth , async( request , response )=>{
    try{
        const { category , producer_id , search } = request.query;

        const can_view_all_for_producer =
            producer_id &&
            request.userId &&
            (request.userRole === 'admin' || request.userId === parseInt(producer_id));

        let sql = `SELECT p.id , p.name , p.description , p.category , p.price ,
                   p.stock_quantity , p.is_available , p.image_url , p.created_at ,
                   u.farm_name AS producer_farm , u.id AS producer_id
                   FROM products p
                   JOIN users u ON p.producer_id = u.id
                   WHERE 1 = 1`;
        const params = [];

        if( !can_view_all_for_producer ){
            sql += ' AND p.is_available = TRUE AND p.stock_quantity > 0';
        }

        if( category ){
            sql += ' AND p.category = ?';
            params.push(category);
        }

        if( producer_id ){
            sql += ' AND p.producer_id = ?';
            params.push(producer_id);
        }

        if( search ){
            sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
            params.push(`%${search}%` , `%${search}%`);
        }

        sql += ' ORDER BY p.created_at DESC';

        const products = await query(sql , params);
        response.json({ products });
    }catch( error ){
        console.error(`Error fetching products: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch products.' });
    }
});

/* GET /api/products/:id — get single product */
router.get('/:id' , async( request , response )=>{
    try{
        const { id } = request.params;

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid product ID.' });
        }

        const products = await query(
            `SELECT p.id , p.name , p.description , p.category , p.price ,
             p.stock_quantity , p.is_available , p.image_url , p.created_at ,
             u.farm_name AS producer_farm , u.id AS producer_id
             FROM products p
             JOIN users u ON p.producer_id = u.id
             WHERE p.id = ?`,
            [id]
        );

        if( products.length === 0 ){
            return response.status(404).json({ error : 'Product not found.' });
        }

        response.json({ product : products[0] });
    }catch( error ){
        console.error(`Error fetching product: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch product.' });
    }
});

/* POST /api/products — producer creates a new product */
router.post('/' , requireAuth , requireProducer , async( request , response )=>{
    try{
        const { name , description , category , price , stock_quantity , image_url } = request.body;

        if( !name || price === undefined ){
            return response.status(400).json({ error : 'name and price are required.' });
        }

        if( isNaN(price) || price <= 0 ){
            return response.status(400).json({ error : 'price must be a positive number.' });
        }

        if( stock_quantity !== undefined && (isNaN(stock_quantity) || stock_quantity < 0) ){
            return response.status(400).json({ error : 'stock_quantity must be a non-negative number.' });
        }

        const result = await query(
            `INSERT INTO products (producer_id , name , description , category , price , stock_quantity , image_url)
             VALUES (? , ? , ? , ? , ? , ? , ?)`,
            [request.userId , name , description ?? null , category ?? null , price , stock_quantity ?? 0 , image_url ?? null]
        );

        const product = await query(`SELECT * FROM products WHERE id = ?` , [result.insertId]);
        response.status(201).json({ message : 'Product created.' , product : product[0] });
    }catch( error ){
        console.error(`Error creating product: ${error.message}`);
        response.status(500).json({ error : 'Failed to create product.' });
    }
});

/* PATCH /api/products/:id — producer updates their product */
router.patch('/:id' , requireAuth , requireProducer , async( request , response )=>{
    try{
        const { id } = request.params;
        const { name , description , category , price , stock_quantity , is_available , image_url } = request.body;

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid product ID.' });
        }

        /* Ensure the product belongs to this producer (unless admin) */
        const products = await query(`SELECT id , producer_id , name , is_available FROM products WHERE id = ?` , [id]);
        if( products.length === 0 ){
            return response.status(404).json({ error : 'Product not found.' });
        }
        if( request.userRole !== 'admin' && products[0].producer_id !== request.userId ){
            return response.status(403).json({ error : 'You do not own this product.' });
        }

        const updateFields = [];
        const updateValues = [];

        if( name !== undefined ){ updateFields.push('name = ?'); updateValues.push(name); }
        if( description !== undefined ){ updateFields.push('description = ?'); updateValues.push(description); }
        if( category !== undefined ){ updateFields.push('category = ?'); updateValues.push(category); }
        if( price !== undefined ){
            if( isNaN(price) || price <= 0 ) return response.status(400).json({ error : 'price must be positive.' });
            updateFields.push('price = ?'); updateValues.push(price);
        }
        if( stock_quantity !== undefined ){
            if( isNaN(stock_quantity) || stock_quantity < 0 ) return response.status(400).json({ error : 'stock_quantity cannot be negative.' });
            updateFields.push('stock_quantity = ?'); updateValues.push(stock_quantity);
        }
        if( is_available !== undefined ){ updateFields.push('is_available = ?'); updateValues.push(is_available); }
        if( image_url !== undefined ){ updateFields.push('image_url = ?'); updateValues.push(image_url); }

        if( updateFields.length === 0 ){
            return response.status(400).json({ error : 'No valid fields to update.' });
        }

        updateValues.push(id);
        await query(`UPDATE products SET ${updateFields.join(', ')} WHERE id = ?` , updateValues);

        const previous_is_available = Boolean(products[0].is_available);
        const next_is_available = is_available !== undefined
            ? Boolean(is_available)
            : previous_is_available;

        if( is_available !== undefined && previous_is_available !== next_is_available ){
            const interestedCustomers = await query(
                `SELECT DISTINCT customer_id FROM (
                    SELECT ci.customer_id
                    FROM cart_items ci
                    WHERE ci.product_id = ?
                    UNION
                    SELECT o.customer_id
                    FROM order_items oi
                    JOIN orders o ON o.id = oi.order_id
                    WHERE oi.product_id = ?
                ) interested_customers`,
                [id , id]
            );

            if( interestedCustomers.length > 0 ){
                const message = next_is_available
                    ? `Product '${products[0].name}' is now available.`
                    : `Product '${products[0].name}' is currently unavailable.`;

                for( const customer of interestedCustomers ){
                    await query(
                        `INSERT INTO notifications (customer_id , product_id , type , message)
                         VALUES (? , ? , 'product_available' , ?)`,
                        [customer.customer_id , id , message]
                    );
                }
            }
        }

        const updated = await query(`SELECT * FROM products WHERE id = ?` , [id]);
        response.json({ message : 'Product updated.' , product : updated[0] });
    }catch( error ){
        console.error(`Error updating product: ${error.message}`);
        response.status(500).json({ error : 'Failed to update product.' });
    }
});

/* DELETE /api/products/:id — producer deletes their product */
router.delete('/:id' , requireAuth , requireProducer , async( request , response )=>{
    try{
        const { id } = request.params;

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid product ID.' });
        }

        const products = await query(`SELECT producer_id FROM products WHERE id = ?` , [id]);
        if( products.length === 0 ){
            return response.status(404).json({ error : 'Product not found.' });
        }
        if( request.userRole !== 'admin' && products[0].producer_id !== request.userId ){
            return response.status(403).json({ error : 'You do not own this product.' });
        }

        await query(`DELETE FROM products WHERE id = ?` , [id]);
        response.json({ message : 'Product deleted.' });
    }catch( error ){
        console.error(`Error deleting product: ${error.message}`);
        response.status(500).json({ error : 'Failed to delete product.' });
    }
});

export default router;