import { useState, useEffect } from 'react';
import '../styles/glh.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';

const CartPage = () => {
  const { navigate } = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCart = async () => {
    try {
      const res = await fetch('/api/cart', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      setError('Failed to load cart');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCart(); }, []);

  const updateQty = async (productId, quantity) => {
    if (quantity < 1) return removeItem(productId);
    await fetch(`/api/cart/${productId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ quantity }),
    });
    fetchCart();
  };

  const removeItem = async (productId) => {
    await fetch(`/api/cart/${productId}`, { method: 'DELETE', credentials: 'include' });
    fetchCart();
  };

  const total = items.reduce((s, i) => s + i.unit_price * i.quantity, 0);

  return (
    <div>
      <Navbar role="customer" />

      <div style={{ maxWidth: '860px', margin: '32px auto', padding: '0 20px 60px' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '20px' }}>
          Your Basket
        </div>

        {error && (
          <div style={{ background: '#fde8e6', color: 'var(--red)', border: '1px solid #f5c6c2', borderRadius: '4px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#888', fontSize: '13px' }}>Loading basket…</div>
        ) : items.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '48px', textAlign: 'center' }}>
            <div style={{ fontSize: '13px', color: '#888', marginBottom: '16px' }}>Your basket is empty.</div>
            <button className="btn btn-deep" onClick={() => navigate('home')}>Continue Shopping ›</button>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>
            {/* Items */}
            <div style={{ flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', overflow: 'hidden', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: 'var(--green-deep)', color: '#fff' }}>
                    <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600 }}>Product</th>
                    <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600 }}>Qty</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>Price</th>
                    <th style={{ padding: '10px 14px', textAlign: 'right', fontWeight: 600 }}>Total</th>
                    <th style={{ padding: '10px 14px' }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, i) => (
                    <tr key={item.product_id} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}>
                      <td style={{ padding: '12px 14px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--charcoal)' }}>{item.name}</div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                          <button onClick={() => updateQty(item.product_id, item.quantity - 1)}
                            style={{ width: '24px', height: '24px', border: '1px solid var(--border)', background: '#f5f5f5', borderRadius: '3px', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>−</button>
                          <span style={{ minWidth: '20px', textAlign: 'center' }}>{item.quantity}</span>
                          <button onClick={() => updateQty(item.product_id, item.quantity + 1)}
                            style={{ width: '24px', height: '24px', border: '1px solid var(--border)', background: '#f5f5f5', borderRadius: '3px', cursor: 'pointer', fontSize: '14px', lineHeight: 1 }}>+</button>
                        </div>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', color: '#555' }}>£{parseFloat(item.unit_price).toFixed(2)}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'right', fontWeight: 600, color: 'var(--green-deep)' }}>£{(item.unit_price * item.quantity).toFixed(2)}</td>
                      <td style={{ padding: '12px 14px', textAlign: 'center' }}>
                        <button onClick={() => removeItem(item.product_id)}
                          style={{ background: 'none', border: 'none', color: 'var(--red)', cursor: 'pointer', fontSize: '16px', lineHeight: 1 }}>×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ marginTop: '12px' }}>
                <button className="btn" onClick={() => navigate('home')} style={{ fontSize: '13px' }}>← Continue Shopping</button>
              </div>
            </div>

            {/* Summary */}
            <div style={{ width: '240px', background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '20px', flexShrink: 0 }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '14px', borderBottom: '2px solid var(--green)', paddingBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Order Summary
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '8px' }}>
                <span>Subtotal</span><span>£{total.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#555', marginBottom: '16px' }}>
                <span>Delivery</span><span style={{ color: 'var(--green-deep)', fontWeight: 600 }}>Calculated at checkout</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '15px', fontWeight: 700, color: 'var(--charcoal)', borderTop: '1px solid var(--border)', paddingTop: '12px', marginBottom: '16px' }}>
                <span>Total</span><span>£{total.toFixed(2)}</span>
              </div>
              <button className="btn btn-deep" style={{ width: '100%', padding: '10px', fontSize: '13px' }} onClick={() => navigate('tracking')}>
                Proceed to Checkout ›
              </button>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
