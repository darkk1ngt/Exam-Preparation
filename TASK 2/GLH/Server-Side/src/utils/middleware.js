import chalk from 'chalk';
import { query } from '../database/connection.js';

/* User authentication check */
export function requireAuth( request , response , next ){
    if(!request.session || !request.session.userId){
        console.log(chalk.yellow(`Unauthorized access attempt to ${request.path}`));
        return response.status(401).json({
            error : 'Authentication Required.',
            message : 'Please log in to access this resource.'
        });
    }

    request.userId = request.session.userId;
    request.userRole = request.session.role;
    next();
}

/* Admin-only access check */
export function requireAdmin( request , response , next ){
    if(!request.userRole || request.userRole !== 'admin'){
        console.log(chalk.yellow(`Admin-only access denied for user ${request.userId}`));
        return response.status(403).json({
            error : 'Forbidden.',
            message : 'This resource is for admins only.'
        });
    }
    next();
}

/* Producer or admin access check */
export async function requireProducer( request , response , next ){
    if(!request.userRole || (request.userRole !== 'producer' && request.userRole !== 'admin')){
        console.log(chalk.yellow(`Producer-only access denied for user ${request.userId}`));
        return response.status(403).json({
            error : 'Forbidden.',
            message : 'This resource is for producers only.'
        });
    }

    if( request.userRole === 'admin' ){
        return next();
    }

    try{
        const rows = await query(
            `SELECT role , email_verified , producer_status FROM users WHERE id = ?`,
            [request.userId]
        );

        if( rows.length === 0 ){
            return response.status(404).json({
                error : 'User not found.',
                message : 'Producer account was not found.'
            });
        }

        const user = rows[0];
        const is_approved_producer =
            user.role === 'producer' &&
            user.email_verified === 1 &&
            user.producer_status === 'approved';

        if( !is_approved_producer ){
            return response.status(403).json({
                error : 'Producer access not approved.',
                message : 'Producer account must be email-verified and approved.'
            });
        }
    }catch( error ){
        console.error(chalk.red(`Producer middleware error: ${error.message}`));
        return response.status(500).json({
            error : 'Authorization check failed.'
        });
    }

    next();
}

export function optionalAuth( request , response , next ){
    if(request.session && request.session.userId){
        request.userId = request.session.userId;
        request.userRole = request.session.role;
    }
    next();
}