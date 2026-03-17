import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProducerDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchOverview();
  }, []);

  const fetchOverview = async () => {
    try {
      const res = await fetch('/api/dashboard/overview', { credentials: 'include' });
      const data = await res.json();
      setOverview(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page"><div className="loading-container"><div className="spinner"></div></div></div>;

  return (
    <div className="page">
      <h1>Producer Dashboard</h1>
      
      <div className="card" style={{ backgroundColor: '#F0F8FF', borderLeft: '4px solid var(--color-green)', marginBottom: '2rem' }}>
        <p><strong>Farm:</strong> {user?.farm_name}</p>
        <p><strong>Status:</strong> <span className="badge badge-success">{user?.producer_status}</span></p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#666', margin: '0 0 0.5rem 0' }}>Products Listed</p>
          <h2 style={{ fontSize: '2rem', margin: '0 0 1rem 0' }}>{overview?.product_count}</h2>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/products')}>Manage</button>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#666', margin: '0 0 0.5rem 0' }}>Pending Orders</p>
          <h2 style={{ fontSize: '2rem', margin: '0 0 1rem 0' }}>{overview?.pending_orders}</h2>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/orders')}>View</button>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#666', margin: '0 0 0.5rem 0' }}>Weekly Revenue</p>
          <h2 style={{ fontSize: '2rem', margin: '0 0 1rem 0' }}>£{overview?.weekly_revenue?.toFixed(2)}</h2>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/analytics')}>Analytics</button>
        </div>
        
        <div className="card" style={{ textAlign: 'center' }}>
          <p style={{ color: '#666', margin: '0 0 0.5rem 0' }}>Low Stock</p>
          <h2 style={{ fontSize: '2rem', margin: '0 0 1rem 0', color: overview?.low_stock_count > 0 ? '#E74C3C' : '#27AE60' }}>{overview?.low_stock_count}</h2>
          <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard/products')}>Restock</button>
        </div>
      </div>

      <div className="card">
        <h2>Quick Links</h2>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/products')} style={{ marginRight: '0.5rem' }}>
          📦 My Products
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/orders')} style={{ marginRight: '0.5rem' }}>
          📋 Orders
        </button>
        <button className="btn btn-primary" onClick={() => navigate('/dashboard/analytics')}>
          📊 Analytics
        </button>
      </div>
    </div>
  );
}
