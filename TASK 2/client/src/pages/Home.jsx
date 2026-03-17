import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return <div className="page"><h1>Welcome!</h1></div>;
  }

  return (
    <div className="page">
      <h1>Welcome back, {user.email}!</h1>
      {user.role === 'customer' && (
        <div style={{ marginTop: '2rem' }}>
          <div className="two-column">
            <div className="card">
              <h3>🛒 Shop</h3>
              <p>Browse and purchase from local producers.</p>
              <button className="btn btn-primary" onClick={() => navigate('/products')}>Start Shopping</button>
            </div>
            <div className="card">
              <h3>📦 Orders</h3>
              <p>Track your orders and delivery status.</p>
              <button className="btn btn-primary" onClick={() => navigate('/orders')}>View Orders</button>
            </div>
          </div>
          <div className="two-column">
            <div className="card">
              <h3>⭐ Loyalty</h3>
              <p>Earn points and get discounts.</p>
              <button className="btn btn-primary" onClick={() => navigate('/loyalty')}>Check Points</button>
            </div>
            <div className="card">
              <h3>🔔 Notifications</h3>
              <p>Stay updated on orders and products.</p>
              <button className="btn btn-primary" onClick={() => navigate('/notifications')}>View Notifications</button>
            </div>
          </div>
        </div>
      )}
      {user.role === 'producer' && (
        <div style={{ marginTop: '2rem' }}>
          <div className="two-column">
            <div className="card">
              <h3>📊 Dashboard</h3>
              <p>View your sales and performance.</p>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>Go to Dashboard</button>
            </div>
            <div className="card">
              <h3>📦 Products</h3>
              <p>Manage your product inventory.</p>
              <button className="btn btn-primary" onClick={() => navigate('/dashboard/products')}>Manage Products</button>
            </div>
          </div>
        </div>
      )}
      {user.role === 'admin' && (
        <div style={{ marginTop: '2rem' }}>
          <div className="two-column">
            <div className="card">
              <h3>✅ Approvals</h3>
              <p>Review pending producer registrations.</p>
              <button className="btn btn-primary" onClick={() => navigate('/admin/producers')}>Pending Approvals</button>
            </div>
            <div className="card">
              <h3>📅 Slots</h3>
              <p>Manage collection slots.</p>
              <button className="btn btn-primary" onClick={() => navigate('/admin/slots')}>Manage Slots</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
