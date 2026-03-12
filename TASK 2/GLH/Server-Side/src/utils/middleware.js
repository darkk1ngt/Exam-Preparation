import chalk from 'chalk';

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
export function requireProducer( request , response , next ){
    if(!request.userRole || (request.userRole !== 'producer' && request.userRole !== 'admin')){
        console.log(chalk.yellow(`Producer-only access denied for user ${request.userId}`));
        return response.status(403).json({
            error : 'Forbidden.',
            message : 'This resource is for producers only.'
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