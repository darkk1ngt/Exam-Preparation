import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

export default function OrderTracking() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      const res = await fetch(`/api/orders/${id}`, { credentials: 'include' });
      const data = await res.json();
      setOrder(data.order);
      setItems(data.items);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page"><div className="loading-container"><div className="spinner"></div></div></div>;
  if (!order) return <div className="page"><p>Order not found</p></div>;

  const statuses = ['pending', 'confirmed', 'ready', 'out_for_delivery', 'collected', 'delivered'];
  const currentIndex = statuses.indexOf(order.status);

  const getStepStatus = (index) => {
    if (index < currentIndex) return 'done';
    if (index === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="page">
      <h1>Order #{order.id}</h1>

      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <div>
            <p><strong>Date:</strong> {new Date(order.created_at).toLocaleDateString()}</p>
            <p><strong>Total:</strong> £{parseFloat(order.total_price).toFixed(2)}</p>
          </div>
          <div>
            <p><strong>Fulfilment:</strong> {order.fulfilment_type}</p>
            {order.fulfilment_type === 'delivery' && (
              <p><strong>Address:</strong> {order.delivery_address_line1}, {order.delivery_city}</p>
            )}
          </div>
        </div>
      </div>

      <div className="card">
        <h2>Order Status</h2>
        <div className="timeline">
          {statuses.map((status, index) => (
            <div key={status} className="timeline-step">
              <div className={`timeline-marker ${getStepStatus(index)}`}>
                {getStepStatus(index) === 'done' ? '✓' : index + 1}
              </div>
              <div className="timeline-content">
                <h4>{status.replace(/_/g, ' ').toUpperCase()}</h4>
              </div>
              {index < statuses.length - 1 && <div className="timeline-connector"></div>}
            </div>
          ))}
        </div>
      </div>

      <div className="card">
        <h2>Items</h2>
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item.id}>
                <td>{item.product_name_snapshot}</td>
                <td>{item.quantity}</td>
                <td>£{parseFloat(item.unit_price).toFixed(2)}</td>
                <td>£{(item.quantity * item.unit_price).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
