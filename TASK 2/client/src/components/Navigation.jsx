import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

export function CustomerNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    // Fetch unread notification count
    fetch('/api/notifications', { credentials: 'include' })
      .then(res => res.json())
      .then(data => {
        const unread = data.notifications.filter(n => !n.is_read).length;
        setUnreadCount(unread);
      })
      .catch(() => {});
  }, []);

  return (
    <nav className="nav" style={{ backgroundColor: '#2D5016' }}>
      <div className="nav-brand" onClick={() => navigate('/')}>Greenfields</div>
      <div className="nav-links">
        <a href="/products">Shop</a>
        <a href="/orders">My Orders</a>
        <a href="/loyalty">Loyalty</a>
      </div>
      <div className="nav-right-section">
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => navigate('/notifications')}>
          🔔
          {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
        </div>
        <div className="avatar" onClick={() => navigate('/account')}>
          {user?.email.charAt(0).toUpperCase()}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

export function ProducerNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="nav nav-producer" style={{ backgroundColor: '#4A7C2F' }}>
      <div className="nav-brand" onClick={() => navigate('/')}>Greenfields</div>
      <div className="nav-links">
        <a href="/dashboard">Dashboard</a>
        <a href="/dashboard/products">My Products</a>
        <a href="/dashboard/orders">Incoming Orders</a>
        <a href="/dashboard/analytics">Analytics</a>
      </div>
      <div className="nav-right-section">
        <div className="avatar" onClick={() => navigate('/account')}>
          {user?.email.charAt(0).toUpperCase()}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}

export function AdminNav() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <nav className="nav nav-admin" style={{ backgroundColor: '#6B4423' }}>
      <div className="nav-brand" onClick={() => navigate('/')}>Greenfields</div>
      <div className="nav-links">
        <a href="/admin/producers">Pending Approvals</a>
        <a href="/admin/slots">Slot Management</a>
      </div>
      <div className="nav-right-section">
        <div className="avatar" onClick={() => navigate('/account')}>
          {user?.email.charAt(0).toUpperCase()}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={logout}>Logout</button>
      </div>
    </nav>
  );
}
