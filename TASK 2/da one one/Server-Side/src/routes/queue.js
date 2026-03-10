import express, { request, response } from 'express';
import { query } from '../database/connection.js';
import { optionalAuth , requireAuth , requireStaff } from '../utils/middleware.js';

const router = express.Router();

/* fetch queue status for a specific attraction */

router.get('/:attractionId' , optionalAuth , async( request , response )=>{
    try{
        const { attractionId } = request.params;

        if( isNaN(attractionId) || attractionId <= 0 ){
            return response.status(400).json({
                error : 'Invalid attraction ID.'
            });
        }

        const queueData = await query(`
            SELECT
                qs.id,
                qs.attraction_id,
                a.name as attraction_name,
                qs.queue_length,
                qs.estimated_wait_minutes,
                qs.last_updated
            FROM queue_status qs
            JOIN attractions a ON qs.attraction_id = a.id
            WHERE qs.attraction_id = ?
            `,[attractionId]);

        if( queueData.length === 0 ){
            return response.status(404).json({
                error : 'Queue status not found.'
            });
        }
        response.json({
            queue : queueData[0]
        });

    }catch(error){
        console.error(`Error fetching queue:${error.message}`);
        response.status(500).json({
            error : 'Failed to fetch queue status.'
        });
    }
});

/* staff udpating queue status */

router.patch('/:attractionId' , requireAuth , requireStaff , async( request , response )=>{
    try{
        const { attractionId } = request.params
        const { queue_length , estimated_wait_minutes } = request.body;

        /* input validation */
        if( isNaN(attractionId) || attractionId <= 0 ){
            return response.status(400).json({
                error : 'Invalid attraction ID.         '
            });
        }

        if( queue_length === undefined || isNaN(queue_length) || queue_length < 0 ){
            return response.status(400).json({
                error : 'queue_length must be a non negative-number.'
            });
        }

        if( estimated_wait_minutes === undefined || isNaN(estimated_wait_minutes) || estimated_wait_minutes < 0){
            return response.status(400).json({
                error : 'estimated_wait_minutes must be a non-negative number.'
            });
        }

        /* update queue status */
        await query(`
            UPDATE queue_status
            SET queue_length = ? , estimated_wait_minutes = ? 
            WHERE attraction_id = ?
            `,[ queue_length , estimated_wait_minutes , attractionId ]);

        /* fetch updated record */

        const updated = await query(
            `SELECT * FROM queue_status WHERE attraction_id = ?
            `,[ attractionId ]);

        response.json({
            message : 'Queue status updated.',
            queue : updated[0]
        });
    }catch( error ){
        console.error(`Error updating queue: ${error.message}`);
        response.status(500).json({
            error : 'Failed to update queue status.'
        });
    }
});


/* fetch all attractions queue statuses */

router.get('/' , optionalAuth , async( request , response )=>{
    try{
        const allQueues = await query(
            `SELECT 
            qs.id,
            qs.attraction_id,
            a.name as attraction_name,
            qs.queue_length,
            qs.estimated_wait_minutes,
            qs.last_updated
        FROM queue_status qs
        JOIN attractions a on qs.attraction_id = a.id
        ORDER BY a.name
        `);

        response.json({
            queue : allQueues
        });

    }catch( error ){
        console.error(`Error fetching all queues: ${error.message}`);
        response.status(500).json({
            error : 'Failed to fetch all queue statuses.'
        });
    }
});

/* Join a queue */
router.post('/:attractionId/join' , requireAuth , async ( request , response )=>{
    try{
        const { attractionId } = request.params;

        if( isNaN( attractionId ) || attractionId <=0 ){
            return response.status(400).json({
                error : 'Invalid attraction ID.'
            });
        }

        /* Increment queue length +1 */
        await query(`
            UPDATE queue_status
            SET queue_length = queue_length + 1,
                estimated_wait_minutes = (queue_length + 1) * 5
            WHERE attraction_id = ?`,
        [attractionId]);

        /* Retrive updated queue information */

        const updated = await query(`
            SELECT * FROM queue_status WHERE attraction_id = ?`,
        [attractionId]);

        response.json({
            message : 'Successfully joined queue',
            queue : updated[0]
        });
    }catch( error ){
        console.error(`Error joing queue:${error.message}`)
        response.status(500).json({
            error : 'Failed to join queue'
        })
    }
})

export default router;
