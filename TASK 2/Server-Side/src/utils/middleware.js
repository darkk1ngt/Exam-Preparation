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

/* User is staff member authentication check */
export function requireStaff( request , response , next ){
    if(!request.userRole || request.userRole !== 'staff'){
        console.log(chalk.yellow(`Staff-only access denied for user ${request.userId}`));
        return response.status(403).json({
            error : 'Forbidden.',
            message : 'This resource is for staff only.'
        });
    }
    next()
}

export function optionalAuth( request , response , next ){
    if(request.session && request.session.userId){
        request.userId = request.session.userId;
        request.userRole = request.session.role;
    }
    next();
}