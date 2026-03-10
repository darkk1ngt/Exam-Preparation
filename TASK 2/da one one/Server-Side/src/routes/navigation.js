import express, { request, response } from 'express';
import { query } from '../database/connection.js';
import { optionalAuth } from '../utils/middleware.js';

const router = express.Router();

/* Calculates distance between the two lat and lon ponts (haversine formula) */

function calculateDistance( lat1 , lon1 , lat2 , lon2 ){
    const R = 637100; // earths radius in meters.
    const dLat = (( lat2 - lat1 ) * Math.PI) / 180;
    const dLon = (( lon2 - lon1 ) * Math.PI) / 180;
    const a = 
        Math.sin( dLat / 2 ) * Math.sin(dLat / 2) +
        Math.cos(( lat1 * Math.PI) / 180)*
        Math.cos(( lat2 * Math.PI) / 180)*
        Math.sin( dLon / 2 ) *
        Math.sin( dLon / 2 );
    const c = 2 * Math.atan2(Math.sqrt( a ), Math.sqrt( 1 - a ));
    return R * c;
}

/* Calculate eta from current location to destination */
/* Body lat and long and attraction id. */

router.post('/eta' , optionalAuth , async( request , response)=>{
    try{
        const { user_latitude , user_longitude , attraction_id } = request.body;

        /* Validate input */

        if( user_latitude === undefined || user_longitude === undefined){
            return response.status(400).json({
                error : 'user_latitude and user_longitude are required.'
            });
        }

        if( isNaN( user_latitude ) || isNaN( user_longitude )){
            return response.status(400).json({
                error : 'Coordinates must be valid numbers.'
            });
        }

        /* Boundary control */

        if( user_latitude <-90 || user_latitude >90 ){
            return response.status(400).json({
                error : 'Latitude must be between -180 and +180 degrees.'
            })
        }

        if( user_longitude < -180 || user_longitude > 180){
            return response.status(400).json({
                error : 'Longitude must be between -180 and +180 degrees.'
            })
        }

        if( !attraction_id || isNaN( attraction_id )){
            return response.status(400).json({
                error : 'attraction_id is required.'
            });
        }

        /* Fetch attraction */

        const attractions = await query(
            `SELECT id , latitude , longitude , name FROM attractions WHERE id = ?`,
        [attraction_id]);

        if( attractions.length === 0 ){
            return response.status(404).json({
                error : 'Attraction not found.'
            })
        }

        const attraction = attractions[0];

        /* Distance calculation */

        const distanceMeters = calculateDistance(
            user_latitude,
            user_longitude,
            parseFloat(attraction.latitude),
            parseFloat(attraction.longitude)
        );

        /* Estimate walking time assuming an average speed ins 1.4m/s */
        
        const walkingSpeedMs = 1.4;
        const estimatedSeconds = distanceMeters / walkingSpeedMs;
        const estimatedMinutes = Math.round( estimatedSeconds / 60 );

        response.json({
            attraction_id : attraction_id,
            attraction_name : attraction.name,
            distance_meters : Math.round(distanceMeters),
            distance_km : ( distanceMeters / 1000 ).toFixed(2),
            estimated_walk_time_minutes : Math.max(1, estimatedMinutes ) // At least 1 minute 
        })
    }catch( error ){
        console.error(`Error calculating ETA: ${error.message}`);
        return response.status(500).json({
            error : 'Failed to calculate ETA.'
        })
    }
});

export default router;