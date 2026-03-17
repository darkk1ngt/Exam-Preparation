import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';

export function ProtectedRoute({ children, requiredRole = null }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/login" />;
  }

  return children;
}

export function PublicRoute({ children, allowIfAuthenticated = false }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="loading-container"><div className="spinner"></div></div>;
  }

  if (user && !allowIfAuthenticated) {
    return <Navigate to="/" />;
  }

  return children;
}
