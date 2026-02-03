import express, { request, response } from 'express';
import { query } from '../database/connection.js';
import { requireAuth , requireStaff } from '../utils/middleware.js';

const router =  express.Router();

/* Fetch all attraction metrics with optional filtering */
router.get('/' , requireAuth , requireStaff , async( request , response )=>{
    try{
        const{ from_date , to_date , attraction_id } = request.query;

        /*  */
        let whereConditions = [];
        let queryParams = [];

        if( from_date ){
            whereConditions.push('sm.metric_date >= ?');
            queryParams.push(from_date);
        }

        if( to_date ){
            whereConditions.push('sm.metric_date <= ?');
            queryParams.push(to_date);
        }
        
        if( attraction_id ){
            whereConditions.push('sm.attraction_id = ?');
            queryParams.push(attraction_id);
        }

        const whereClause = whereConditions.length > 0 ?
        `WHERE ${whereConditions.join(' AND ')}` : '';

        const metrics = await query(`
            SELECT
                sm.id,
                sm.attraction_id,
                a.name as attraction_name,
                sm.metric_date,
                sm.ticket_sales,
                sm.uptime_percentage,
                sm.visitors_count,
                sm.avg_wait_time_minutes,
                sm.recorded_At
            FROM staff_metrics sm
            JOIN attractions a ON sm.attraction_id = a.id
            ${whereClause}
            ORDER BY sm.metric_date DESC, a.name
            `,queryParams);

            response.json({
                metrics : metrics,
                filters : {
                    from_date : from_date || null,
                    to_date : to_date || null,
                    attraction_id : attraction_id || null
                }
            });
    }catch( error ){
        console.error(`Error fetching metrics: ${error.message}`);
        response.status(500).json({
            error : 'Failed to fetch metrics.'
        });
    }
});

/* Fetch metric summary */

router.get('/summary' , requireAuth , requireStaff , async( request , response )=>{
    try{
        const{ from_date , to_date } = request.query;

        let whereClause = '';
        let queryParams = [];

        if( from_date || to_date ){
            const conditions = [];

            if( from_date ){
                conditions.push('sm.metric_date >= ?');
                queryParams.push(from_date);
            }

            if( to_date ){
                conditions.push('sm.metric_date <= ?');
                queryParams.push(to_date);
            }

            whereClause = `WHERE ${conditions.join( ' AND ' )}`;
        }

        const summary = await query(`
            SELECT 
                COUNT( DISTINCT sm.attraction_id ) as num_attractions,
                SUM( sm.ticket_sales ) as total_ticket_sales,
                ROUND( AVG( sm.uptime_percentage ) , 2 ) as avg_uptime_percentage,
                SUM( sm.visitors_count ) as total_visitors,
                ROUND( AVG( sm.avg_wait_time_minutes ) , 2 ) as avg_wait_time_minutes,
                MIN( sm.metric_date ) as period_start,
                MAX( sm.metric_date ) as period_end
            FROM staff_metrics sm
            ${whereClause}`,
        queryParams);

        response.json({
            summary : summary[0],
            filters : {
                from_date : from_date || null,
                to_date : to_date || null
            }
        })
    }catch( error ){
        console.error(`Error fetching metrics: ${error.message}`);
        response.status(500).json({
            error : 'Failed to fetch metrics.'
        });
    }
});

/* Update metrics for an attraction */
router.post('/' , requireAuth , requireStaff , async( request , response )=>{
    try {
        const{ attraction_id , metric_date , ticket_sales , uptime_percentage , visitors_count , avg_wait_time_minutes } = request.body

        /* Validate required fields */

        if( !attraction_id || !metric_date ){
            return response.status(400).json({
                error : 'attraction_id and metric_date are required.'
            });
        }

        /* Validate data types */

        if( isNaN( attraction_id ) || isNaN( ticket_sales ) || isNaN( uptime_percentage ) || isNaN( visitors_count )){
            return response.status(400).json({
                error : 'All metrics must be numbers.'
            });
        }

        /* Validate percentages */

        if( uptime_percentage < 0 || uptime_percentage > 100 ){
            return response.status(400).json({
                error : 'uptime_percentage must be greater than 0 and less than 100.'
            });
        }

        /* Insert or Update */

        await query(`
            INSERT INTO staff_metrics
            ( attraction_id , metric_date , ticket_sales , uptime_percentage , visitors_count , avg_wait_time_minutes ) VALUES ( ? , ? , ? , ? , ? , ? )
             ON DUPLICATE KEY UPDATE
             s = VALUES(ticket_sales),
            uptime_percentage = VALUES(uptime_percentage),
            visitors_count = VALUES(visitors_count),
            avg_wait_time_minutes = VALUES(avg_wait_time_minutes)
        `, [attraction_id, metric_date, ticket_sales, uptime_percentage, visitors_count, avg_wait_time_minutes]);

        response.json({
            message : 'Metrics recorded successfully.'
        })
    } catch (error) {
        console.error(`Error recording metrics:${error.message}`);
        response.status(500).json({
            error : 'Failed to record metrics.'
        })
    }
})

export default router;