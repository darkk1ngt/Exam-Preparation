import { useEffect, useMemo, useState } from 'react';
import '../styles/glh.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import api from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';
import { UK_CITY_AREAS, formatUkPostcodeInput, normalizeUkPostcode, getUkPostcodeHint } from '../data/ukLocations.js';

const CheckoutPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { navigate } = useNavigation();

  const [items, setItems] = useState([]);
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [placing, setPlacing] = useState(false);

  const [fulfilmentType, setFulfilmentType] = useState('collection');
  const [collectionSlotId, setCollectionSlotId] = useState('');
  const [deliveryAddress1, setDeliveryAddress1] = useState('');
  const [deliveryAddress2, setDeliveryAddress2] = useState('');
  const [deliveryCity, setDeliveryCity] = useState('');
  const [deliveryPostcode, setDeliveryPostcode] = useState('');
  const deliveryPostcodeHint = getUkPostcodeHint(deliveryCity);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      navigate('login');
      return;
    }

    const load = async () => {
      try {
        const [cartData, slotsData] = await Promise.all([
          api.get('/cart'),
          api.get('/slots'),
        ]);
        setItems(cartData.items || []);
        setSlots(slotsData.slots || []);
      } catch (err) {
        setError(err.message || 'Failed to load checkout data');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, authLoading, navigate]);

  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.quantity), 0),
    [items]
  );

  const placeOrder = async () => {
    setError('');

    if (items.length === 0) {
      setError('Your basket is empty.');
      return;
    }

    if (fulfilmentType === 'collection' && !collectionSlotId) {
      setError('Please select a collection slot.');
      return;
    }

    if (
      fulfilmentType === 'delivery' &&
      (!deliveryAddress1 || !deliveryCity || !deliveryPostcode)
    ) {
      setError('Please complete delivery address fields.');
      return;
    }

    const normalizedPostcode = fulfilmentType === 'delivery'
      ? normalizeUkPostcode(deliveryPostcode)
      : '';

    if (fulfilmentType === 'delivery' && !normalizedPostcode) {
      setError(`Enter a valid UK postcode, for example ${deliveryPostcodeHint}.`);
      return;
    }

    setPlacing(true);
    try {
      await api.post('/orders', {
        fulfilment_type: fulfilmentType,
        collection_slot_id: fulfilmentType === 'collection' ? Number(collectionSlotId) : undefined,
        delivery_address_line1: fulfilmentType === 'delivery' ? deliveryAddress1 : undefined,
        delivery_address_line2: fulfilmentType === 'delivery' ? deliveryAddress2 : undefined,
        delivery_city: fulfilmentType === 'delivery' ? deliveryCity : undefined,
        delivery_postcode: fulfilmentType === 'delivery' ? normalizedPostcode : undefined,
      });
      navigate('tracking');
    } catch (err) {
      setError(err.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (authLoading || loading) {
    return <div style={{ padding: '60px', textAlign: 'center', color: '#888' }}>Loading…</div>;
  }

  return (
    <div>
      <Navbar role="customer" />

      <div style={{ maxWidth: '960px', margin: '32px auto', padding: '0 20px 60px' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '20px' }}>
          Checkout
        </div>

        {error && (
          <div style={{ background: '#fde8e6', color: 'var(--red)', border: '1px solid #f5c6c2', borderRadius: '4px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '24px' }}>
          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '12px' }}>
              Fulfilment
            </div>

            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px', fontSize: '13px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  checked={fulfilmentType === 'collection'}
                  onChange={() => setFulfilmentType('collection')}
                />
                Collection
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="radio"
                  checked={fulfilmentType === 'delivery'}
                  onChange={() => setFulfilmentType('delivery')}
                />
                Delivery
              </label>
            </div>

            {fulfilmentType === 'collection' ? (
              <div>
                <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '6px' }}>
                  Collection Slot
                </label>
                <select
                  className="form-input"
                  style={{ width: '100%', maxWidth: '100%' }}
                  value={collectionSlotId}
                  onChange={(e) => setCollectionSlotId(e.target.value)}
                >
                  <option value="">Select a slot</option>
                  {slots
                    .filter((slot) => slot.is_available)
                    .map((slot) => (
                      <option key={slot.id} value={slot.id}>
                        {new Date(slot.slot_date).toLocaleDateString()} {String(slot.slot_time).slice(0, 5)} ({slot.current_bookings}/{slot.max_capacity})
                      </option>
                    ))}
                </select>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '10px' }}>
                <input className="form-input" placeholder="Address line 1" value={deliveryAddress1} onChange={(e) => setDeliveryAddress1(e.target.value)} />
                <input className="form-input" placeholder="Address line 2 (optional)" value={deliveryAddress2} onChange={(e) => setDeliveryAddress2(e.target.value)} />
                <>
                  <input
                    list="uk-city-areas-checkout"
                    className="form-input"
                    placeholder="Type to search city/area"
                    value={deliveryCity}
                    onChange={(e) => setDeliveryCity(e.target.value)}
                  />
                  <datalist id="uk-city-areas-checkout">
                    {UK_CITY_AREAS.map((city) => (
                      <option key={city} value={city} />
                    ))}
                  </datalist>
                </>
                <input
                  className="form-input"
                  placeholder={`Postcode (e.g. ${deliveryPostcodeHint})`}
                  value={deliveryPostcode}
                  onChange={(e) => setDeliveryPostcode(formatUkPostcodeInput(e.target.value))}
                />
                <div style={{ fontSize: '11px', color: '#7a7a7a', marginTop: '-4px' }}>
                  Example for selected city/area: {deliveryPostcodeHint}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '20px', height: 'fit-content' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '10px' }}>Order Summary</div>
            <div style={{ fontSize: '12px', color: '#666', marginBottom: '12px' }}>{items.length} item(s)</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px' }}>
              <span>Subtotal</span>
              <span>£{subtotal.toFixed(2)}</span>
            </div>
            <button
              className="btn btn-deep"
              style={{ width: '100%', marginTop: '12px' }}
              onClick={placeOrder}
              disabled={placing || items.length === 0}
            >
              {placing ? 'Placing…' : 'Place Order ›'}
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default CheckoutPage;
