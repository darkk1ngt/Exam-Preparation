import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders', { credentials: 'include' });
      const data = await res.json();
      setOrders(data.orders);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#F39C12',
      confirmed: '#3498DB',
      ready: '#9B59B6',
      out_for_delivery: '#E74C3C',
      collected: '#27AE60',
      delivered: '#27AE60',
      cancelled: '#95A5A6'
    };
    return colors[status] || '#95A5A6';
  };

  return (
    <div className="page">
      <h1>Order History</h1>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : orders.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>No orders yet</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Start Shopping</button>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Date</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id}>
                  <td>#{order.id}</td>
                  <td>{new Date(order.created_at).toLocaleDateString()}</td>
                  <td>£{parseFloat(order.total_price).toFixed(2)}</td>
                  <td>
                    <span className="badge" style={{ backgroundColor: getStatusColor(order.status), color: 'white' }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => navigate(`/orders/${order.id}`)}>
                      Track
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
