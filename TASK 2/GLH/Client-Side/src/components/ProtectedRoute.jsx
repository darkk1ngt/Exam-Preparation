import { useAuth } from "../context/AuthContext.jsx";
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children , allowed_roles , require_producer_approval = false }){
    const { user , loading } = useAuth();

    if(loading){
        return<div>Loading...</div>
    }

    if( !user ){
        return <Navigate to='/login' />;
    }

    if( allowed_roles?.length && !allowed_roles.includes(user.role) ){
        return <Navigate to='/' />;
    }

    if( require_producer_approval ){
        const has_access =
            user.role === 'producer' &&
            user.email_verified === true &&
            user.producer_status === 'approved';

        if( !has_access ){
            return <Navigate to='/' />;
        }
    }

    return children;
}