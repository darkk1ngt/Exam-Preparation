import express from 'express';
import { query } from '../database/connection.js';
import { requireAuth , requireAdmin } from '../utils/middleware.js';

const router = express.Router();

/* All admin routes require authentication and admin role */
router.use(requireAuth , requireAdmin);

/* GET /api/admin/users — list all users */
router.get('/users' , async( request , response )=>{
    try{
        const { role } = request.query;

        let sql = `SELECT id , email , role , farm_name , contact_number , email_verified , producer_status , created_at FROM users`;
        const params = [];

        if( role ){
            sql += ' WHERE role = ?';
            params.push(role);
        }

        sql += ' ORDER BY created_at DESC';

        const users = await query(sql , params);
        response.json({ users });
    }catch( error ){
        console.error(`Error fetching users: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch users.' });
    }
});

/* PATCH /api/admin/users/:id/role — change a user's role */
router.patch('/users/:id/role' , async( request , response )=>{
    try{
        const { id } = request.params;
        const { role } = request.body;

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid user ID.' });
        }

        const validRoles = ['customer' , 'producer' , 'admin'];
        if( !role || !validRoles.includes(role) ){
            return response.status(400).json({ error : `role must be one of: ${validRoles.join(', ')}.` });
        }

        /* Prevent demoting yourself */
        if( parseInt(id) === request.userId ){
            return response.status(400).json({ error : 'You cannot change your own role.' });
        }

        const users = await query(`SELECT id FROM users WHERE id = ?` , [id]);
        if( users.length === 0 ){
            return response.status(404).json({ error : 'User not found.' });
        }

        await query(`UPDATE users SET role = ? WHERE id = ?` , [role , id]);
        response.json({ message : `User role updated to '${role}'.` });
    }catch( error ){
        console.error(`Error updating user role: ${error.message}`);
        response.status(500).json({ error : 'Failed to update user role.' });
    }
});

/* PATCH /api/admin/users/:id/producer-status — approve/reject producer applications */
router.patch('/users/:id/producer-status' , async( request , response )=>{
    try{
        const { id } = request.params;
        const { producer_status } = request.body;

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid user ID.' });
        }

        const validStatuses = ['approved' , 'rejected' , 'pending'];
        if( !producer_status || !validStatuses.includes(producer_status) ){
            return response.status(400).json({
                error : `producer_status must be one of: ${validStatuses.join(', ')}.`
            });
        }

        const users = await query(
            `SELECT id , role FROM users WHERE id = ?`,
            [id]
        );

        if( users.length === 0 ){
            return response.status(404).json({ error : 'User not found.' });
        }

        await query(
            `UPDATE users SET role = 'producer' , producer_status = ? WHERE id = ?`,
            [producer_status , id]
        );

        response.json({ message : `Producer status updated to '${producer_status}'.` });
    }catch( error ){
        console.error(`Error updating producer status: ${error.message}`);
        response.status(500).json({ error : 'Failed to update producer status.' });
    }
});

/* DELETE /api/admin/users/:id — delete a user */
router.delete('/users/:id' , async( request , response )=>{
    try{
        const { id } = request.params;

        if( isNaN(id) ){
            return response.status(400).json({ error : 'Invalid user ID.' });
        }

        if( parseInt(id) === request.userId ){
            return response.status(400).json({ error : 'You cannot delete your own account.' });
        }

        const result = await query(`DELETE FROM users WHERE id = ?` , [id]);
        if( result.affectedRows === 0 ){
            return response.status(404).json({ error : 'User not found.' });
        }

        response.json({ message : 'User deleted.' });
    }catch( error ){
        console.error(`Error deleting user: ${error.message}`);
        response.status(500).json({ error : 'Failed to delete user.' });
    }
});

/* GET /api/admin/orders — list all orders */
router.get('/orders' , async( request , response )=>{
    try{
        const { status } = request.query;

        let sql = `SELECT o.id , o.customer_id , o.total_price , o.discount_applied ,
                   o.status , o.fulfilment_type , o.created_at ,
                   u.email AS customer_email ,
                   cs.slot_date , cs.slot_time
                   FROM orders o
                   JOIN users u ON o.customer_id = u.id
                   LEFT JOIN collection_slots cs ON o.collection_slot_id = cs.id`;
        const params = [];

        if( status ){
            sql += ' WHERE o.status = ?';
            params.push(status);
        }

        sql += ' ORDER BY o.created_at DESC';

        const orders = await query(sql , params);
        response.json({ orders });
    }catch( error ){
        console.error(`Error fetching orders: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch orders.' });
    }
});

/* GET /api/admin/products — list all products including unavailable ones */
router.get('/products' , async( request , response )=>{
    try{
        const products = await query(
            `SELECT p.* , u.email AS producer_email , u.farm_name
             FROM products p
             JOIN users u ON p.producer_id = u.id
             ORDER BY p.created_at DESC`
        );
        response.json({ products });
    }catch( error ){
        console.error(`Error fetching products: ${error.message}`);
        response.status(500).json({ error : 'Failed to fetch products.' });
    }
});

export default router;