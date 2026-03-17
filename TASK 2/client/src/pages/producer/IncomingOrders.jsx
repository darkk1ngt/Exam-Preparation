import { useState, useEffect } from 'react';

export default function IncomingOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/dashboard/orders', { credentials: 'include' });
      const data = await res.json();
      setOrders(data.orders);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, newStatus) => {
    try {
      await fetch(`/api/dashboard/orders/${orderId}/status`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      fetchOrders();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const statuses = ['pending', 'confirmed', 'ready', 'out_for_delivery', 'collected', 'delivered', 'cancelled'];

  const statusColors = {
    pending: '#FF9800',
    confirmed: '#2196F3',
    ready: '#9C27B0',
    out_for_delivery: '#F44336',
    collected: '#4CAF50',
    delivered: '#4CAF50',
    cancelled: '#757575'
  };

  if (loading) return <div className="page"><div className="loading-container"><div className="spinner"></div></div></div>;

  return (
    <div className="page">
      <h1>Incoming Orders</h1>

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>#{order.id}</td>
                <td>{order.item_count} item{order.item_count !== 1 ? 's' : ''}</td>
                <td>£{parseFloat(order.total_price).toFixed(2)}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    style={{
                      padding: '0.5rem',
                      borderRadius: '4px',
                      border: `2px solid ${statusColors[order.status]}`,
                      backgroundColor: statusColors[order.status],
                      color: 'white',
                      fontWeight: 'bold',
                      cursor: 'pointer'
                    }}
                  >
                    {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').toUpperCase()}</option>)}
                  </select>
                </td>
                <td>{new Date(order.created_at).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
