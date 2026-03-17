import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProtectedRoute, PublicRoute } from './components/ProtectedRoute';
import { CustomerNav, ProducerNav, AdminNav } from './components/Navigation';

// Auth Pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';

// Customer Pages
import ProductBrowsing from './pages/ProductBrowsing';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';
import OrderTracking from './pages/OrderTracking';
import Loyalty from './pages/Loyalty';
import Notifications from './pages/Notifications';

// Shared Pages
import Account from './pages/Account';
import Home from './pages/Home';
import NotFound from './pages/NotFound';

// Producer Pages
import ProducerDashboard from './pages/producer/Dashboard';
import MyProducts from './pages/producer/MyProducts';
import IncomingOrders from './pages/producer/IncomingOrders';
import Analytics from './pages/producer/Analytics';

// Admin Pages
import AdminPanel from './pages/admin/AdminPanel';
import PendingProducers from './pages/admin/PendingProducers';
import SlotManagement from './pages/admin/SlotManagement';

export function AppContent() {
  const { user } = useAuth();

  const getNav = () => {
    if (user?.role === 'producer') return <ProducerNav />;
    if (user?.role === 'admin') return <AdminNav />;
    if (user?.role === 'customer') return <CustomerNav />;
    return null;
  };

  const isAuthPage = ['/login', '/register', '/forgot-password', '/reset-password', '/verify-email'].includes(window.location.pathname);

  return (
    <div>
      {!isAuthPage && getNav()}
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<PublicRoute allowIfAuthenticated={true}><Login /></PublicRoute>} />
        <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
        <Route path="/forgot-password" element={<PublicRoute allowIfAuthenticated={true}><ForgotPassword /></PublicRoute>} />
        <Route path="/reset-password" element={<PublicRoute allowIfAuthenticated={true}><ResetPassword /></PublicRoute>} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        {/* Customer Routes */}
        <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
        <Route path="/products" element={<ProtectedRoute requiredRole="customer"><ProductBrowsing /></ProtectedRoute>} />
        <Route path="/cart" element={<ProtectedRoute requiredRole="customer"><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute requiredRole="customer"><Checkout /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute requiredRole="customer"><OrderHistory /></ProtectedRoute>} />
        <Route path="/orders/:id" element={<ProtectedRoute requiredRole="customer"><OrderTracking /></ProtectedRoute>} />
        <Route path="/loyalty" element={<ProtectedRoute requiredRole="customer"><Loyalty /></ProtectedRoute>} />
        <Route path="/notifications" element={<ProtectedRoute requiredRole="customer"><Notifications /></ProtectedRoute>} />

        {/* Producer Routes */}
        <Route path="/dashboard" element={<ProtectedRoute requiredRole="producer"><ProducerDashboard /></ProtectedRoute>} />
        <Route path="/dashboard/products" element={<ProtectedRoute requiredRole="producer"><MyProducts /></ProtectedRoute>} />
        <Route path="/dashboard/orders" element={<ProtectedRoute requiredRole="producer"><IncomingOrders /></ProtectedRoute>} />
        <Route path="/dashboard/analytics" element={<ProtectedRoute requiredRole="producer"><Analytics /></ProtectedRoute>} />

        {/* Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminPanel /></ProtectedRoute>} />
        <Route path="/admin/producers" element={<ProtectedRoute requiredRole="admin"><PendingProducers /></ProtectedRoute>} />
        <Route path="/admin/slots" element={<ProtectedRoute requiredRole="admin"><SlotManagement /></ProtectedRoute>} />

        {/* Shared */}
        <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}
