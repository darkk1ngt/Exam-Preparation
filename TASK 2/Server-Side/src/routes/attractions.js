import express, { request, response, Router } from 'express';
import { query } from '../database/connection.js';
import { optionalAuth } from '../utils/middleware.js';

const router = express.Router();

/* fetch all attractions with a current queue status */

router.get('/' , optionalAuth , async ( request , response )=>{
    try{
        const attractions = await query(`
            SELECT
            a.id,
            a.name,
            a.description,
            a.category,
            a.latitude,
            a.longitude,
            a.estimated_duration_minutes,
            a.capacity,
            a.is_open,
            q.queue_length,
            q.estimated_wait_minutes,
            q.last_updated as queue_updated_at
            FROM attractions a
            LEFT JOIN queue_status q ON a.id = q.attraction_id
            WHERE a.is_open = TRUE
            `);
            response.json({
                attractions : attractions
            });
    }catch( error ){
        console.error(`Error fetching attractions: ${error.message}`);
        response.status(500).json({
            error : 'Failed to fetch attractions'
        });
    }
});


/* fetch a particular attraction */

router.get( '/:id' , optionalAuth , async( request , response )=>{
    try{
        const { id } = request.params;

        /* Validate that ID is a number */
        if( isNaN(id) || id <= 0){
            return response.status(400).json({
                error : 'Invalid attraction ID.'
            });
        }

        const attractions = await query(`
            SELECT
            a.id, 
            a.name,
            a.description,
            a.category,
            a.latitude,
            a.longitude,
            a.estimated_duration_minutes,
            a.capacity,
            a.is_open,
            q.queue_length,
            q.estimated_wait_minutes,
            q.last_updated as queue_updated_at
            FROM attractions a
            LEFT JOIN queue_status q ON a.id = q.attraction_id
            WHERE a.id = ?
            `,[id]);

            if( attractions.length === 0 ){
                return response.status(404).json({
                    error : 'Attraction not found.'
                });
            }

            response.json({
                attraction : attractions[0]
            });

    }catch( error ){
        console.error(`Error fetching attraction: ${error.message}`);
        response.status(500).json({
            error : 'Failed to fetch attraction.'
        });
    }
});

export default router;