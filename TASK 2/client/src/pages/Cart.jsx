import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' });
      const data = await res.json();
      setItems(data.items);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (productId, quantity) => {
    try {
      await fetch(`/api/cart/${productId}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ quantity })
      });
      fetchCart();
    } catch (err) {
      alert('Failed to update');
    }
  };

  const removeItem = async (productId) => {
    try {
      await fetch(`/api/cart/${productId}`, { method: 'DELETE', credentials: 'include' });
      fetchCart();
    } catch (err) {
      alert('Failed to remove');
    }
  };

  const total = items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);

  return (
    <div className="page">
      <h1>Shopping Cart</h1>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : items.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>Your cart is empty</p>
          <button className="btn btn-primary" onClick={() => navigate('/products')}>Continue Shopping</button>
        </div>
      ) : (
        <>
          <div className="card">
            {items.map(item => (
              <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', borderBottom: '1px solid #eee' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0' }}>{item.name}</h3>
                  <p style={{ margin: 0, color: '#666' }}>£{parseFloat(item.unit_price).toFixed(2)} each</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button className="btn btn-sm" onClick={() => updateQuantity(item.product_id, Math.max(1, item.quantity - 1))}>−</button>
                  <input type="number" value={item.quantity} readOnly style={{ width: '50px', textAlign: 'center', padding: '0.5rem' }} />
                  <button className="btn btn-sm" onClick={() => updateQuantity(item.product_id, item.quantity + 1)}>+</button>
                </div>
                <div style={{ marginRight: '1rem', minWidth: '100px', textAlign: 'right' }}>
                  <strong>£{(item.unit_price * item.quantity).toFixed(2)}</strong>
                </div>
                <button className="btn btn-sm btn-danger" onClick={() => removeItem(item.product_id)}>Remove</button>
              </div>
            ))}
          </div>

          <div className="card" style={{ backgroundColor: '#f9f9f9', textAlign: 'right' }}>
            <h3>Subtotal: £{total.toFixed(2)}</h3>
          </div>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary" onClick={() => navigate('/products')}>Continue Shopping</button>
            <button className="btn btn-primary" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
          </div>
        </>
      )}
    </div>
  );
}
