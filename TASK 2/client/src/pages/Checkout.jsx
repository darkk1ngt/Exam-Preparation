import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loyalty, setLoyalty] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [fulfilment, setFulfilment] = useState('collection');
  const [address, setAddress] = useState({ line1: '', line2: '', city: '', postcode: '' });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const fetchCheckoutData = async () => {
    try {
      const [cartRes, loyaltyRes, slotsRes] = await Promise.all([
        fetch('/api/cart', { credentials: 'include' }),
        fetch('/api/loyalty', { credentials: 'include' }),
        fetch('/api/slots', { credentials: 'include' })
      ]);

      const cartData = await cartRes.json();
      const loyaltyData = await loyaltyRes.json();
      const slotsData = await slotsRes.json();

      setCartItems(cartData.items);
      setLoyalty(loyaltyData);
      setSlots(slotsData.slots);
    } catch (err) {
      setError('Failed to load checkout data');
    } finally {
      setLoading(false);
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
  const discount = loyalty?.discount_active ? loyalty.discount_value : 0;
  const total = Math.max(0, subtotal - discount);

  const placeOrder = async () => {
    if (fulfilment === 'collection' && !selectedSlot) {
      return setError('Please select a collection slot');
    }
    if (fulfilment === 'delivery' && (!address.line1 || !address.city || !address.postcode)) {
      return setError('Please enter complete delivery address');
    }

    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          collection_slot_id: fulfilment === 'collection' ? selectedSlot : null,
          fulfilment_type: fulfilment,
          delivery_address_line1: address.line1 || null,
          delivery_address_line2: address.line2 || null,
          delivery_city: address.city || null,
          delivery_postcode: address.postcode || null
        })
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.error || 'Order failed');
      }

      alert('Order placed successfully!');
      navigate(`/orders/${data.orderId}`);
    } catch (err) {
      setError('Failed to place order');
    }
  };

  if (loading) return <div className="page"><div className="loading-container"><div className="spinner"></div></div></div>;

  return (
    <div className="page">
      <h1>Checkout</h1>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="two-column">
        <div>
          <div className="card">
            <h2>Order Summary</h2>
            {cartItems.map(item => (
              <div key={item.product_id} style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '1rem', borderBottom: '1px solid #eee' }}>
                <div>
                  <p style={{ margin: 0 }}>{item.name} x{item.quantity}</p>
                </div>
                <p style={{ margin: 0 }}>£{(item.unit_price * item.quantity).toFixed(2)}</p>
              </div>
            ))}

            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '2px solid #ddd' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <span>Subtotal:</span>
                <span>£{subtotal.toFixed(2)}</span>
              </div>
              {loyalty?.discount_active && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--color-success)' }}>
                  <span>Discount:</span>
                  <span>-£{discount.toFixed(2)}</span>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 'bold' }}>
                <span>Total:</span>
                <span>£{total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {loyalty?.discount_active && (
            <div className="card" style={{ backgroundColor: '#D4EDDA', borderLeft: '4px solid var(--color-success)' }}>
              <h3 style={{ color: '#155724' }}>🎁 Loyalty Discount Active</h3>
              <p>You have {loyalty.points_balance} points!</p>
              <p>Discount: £{loyalty.discount_value}</p>
            </div>
          )}
        </div>

        <div>
          <div className="card">
            <h2>Fulfilment</h2>

            <div className="form-group">
              <label>Choose fulfilment type:</label>
              <select value={fulfilment} onChange={(e) => setFulfilment(e.target.value)}>
                <option value="collection">Collection</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>

            {fulfilment === 'collection' ? (
              <div>
                <label>Select Collection Slot:</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginTop: '1rem' }}>
                  {slots.map(slot => (
                    <button
                      key={slot.id}
                      className={`card ${selectedSlot === slot.id ? 'active' : ''}`}
                      onClick={() => setSelectedSlot(slot.id)}
                      style={{
                        cursor: 'pointer',
                        border: selectedSlot === slot.id ? '2px solid var(--color-green)' : '1px solid #ddd',
                        padding: '1rem'
                      }}
                    >
                      <p style={{ margin: 0, fontWeight: 'bold' }}>{slot.slot_date}</p>
                      <p style={{ margin: '0.5rem 0 0 0' }}>{slot.slot_time}</p>
                      <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#666' }}>
                        {slot.current_bookings}/{slot.max_capacity}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="form-group">
                  <label>Address Line 1</label>
                  <input type="text" value={address.line1} onChange={(e) => setAddress({ ...address, line1: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Address Line 2 (optional)</label>
                  <input type="text" value={address.line2} onChange={(e) => setAddress({ ...address, line2: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>City</label>
                  <input type="text" value={address.city} onChange={(e) => setAddress({ ...address, city: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Postcode</label>
                  <input type="text" value={address.postcode} onChange={(e) => setAddress({ ...address, postcode: e.target.value })} />
                </div>
              </div>
            )}
          </div>

          <button className="btn btn-primary btn-block" onClick={placeOrder}>Place Order</button>
        </div>
      </div>
    </div>
  );
}
