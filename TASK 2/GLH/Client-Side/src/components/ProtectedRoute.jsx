import { useAuth } from "../context/AuthContext.jsx";
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }){
    const { user , loading } = useAuth();

    if(loading){
        return<div>Loading...</div>
    }

    return user ? children : <Navigate to='/login' />;
}