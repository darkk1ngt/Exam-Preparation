/* User authentication check */
export function requireAuth(request, response, next) {
    if (!request.session?.user) {
        return response.status(401).json({
            error: 'Authentication Required.',
            message: 'Please log in to access this resource.'
        });
    }
    next();
}

/* Producer role check — verifies role, email verified, and approval status */
export function requireProducer(request, response, next) {
    if (!request.session?.user || request.session.user.role !== 'producer') {
        return response.status(403).json({
            error: 'Forbidden.',
            message: 'Producer access required.'
        });
    }
    if (!request.session.user.email_verified) {
        return response.status(403).json({ error: 'Email not verified' });
    }
    if (request.session.user.producer_status !== 'approved') {
        return response.status(403).json({ error: 'Producer not approved' });
    }
    next();
}

/* Admin role check */
export function requireAdmin(request, response, next) {
    if (!request.session?.user || request.session.user.role !== 'admin') {
        return response.status(403).json({
            error: 'Forbidden.',
            message: 'Admin access required.'
        });
    }
    next();
}
