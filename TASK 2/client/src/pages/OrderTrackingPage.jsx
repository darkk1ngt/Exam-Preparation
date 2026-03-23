import { useState, useEffect } from 'react';
import '../styles/glh.css';
import Navbar from '../components/Navbar.jsx';
import AccountSidebar from '../components/AccountSidebar.jsx';
import Footer from '../components/Footer.jsx';
import StatusTimeline from '../components/StatusTimeline.jsx';
import api from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';

const ACCOUNT_CATS = ['SHOP', 'MY ORDERS', 'LOYALTY', 'ACCOUNT'];

const STATUS_STEPS = ['pending', 'confirmed', 'ready', 'out_for_delivery', 'collected'];

function buildTimeline(order) {
  const labels = {
    pending:          'Order Placed',
    confirmed:        'Order Confirmed',
    ready:            'Ready for Collection',
    out_for_delivery: 'Out for Delivery',
    collected:        'Collected',
    delivered:        'Delivered',
  };
  const idx = STATUS_STEPS.indexOf(order.status);
  return STATUS_STEPS.map((s, i) => ({
    label: labels[s] || s,
    time:  i <= idx ? new Date(order.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : 'Pending',
    done:  i < idx,
    active: i === idx,
  }));
}

const statusTag = (s) => {
  if (['collected','delivered'].includes(s)) return { label: s.charAt(0).toUpperCase() + s.slice(1), cls: 'tag-green' };
  if (s === 'cancelled') return { label: 'Cancelled', cls: 'tag-red' };
  return { label: 'In Progress', cls: 'tag-amber' };
};

const OrderTrackingPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { navigate } = useNavigation();
  const [orders, setOrders] = useState([]);
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('login'); return; }
    api.get('/orders')
      .then(data => {
        const list = data.orders || [];
        setOrders(list);
        if (list.length > 0) setSelected(list[0].id);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user, authLoading]);

  useEffect(() => {
    if (!selected) return;

    const fetchOrderDetail = () => {
      api.get(`/orders/${selected}`)
        .then(data => setDetail(data))
        .catch(() => {});
    };

    fetchOrderDetail();
    const interval = setInterval(fetchOrderDetail, 2000);
    return () => clearInterval(interval);
  }, [selected]);

  if (authLoading || loading) return <div style={{padding:'60px', textAlign:'center', color:'#888'}}>Loading…</div>;

  const selectedOrder = detail?.order;

  return (
    <div>
      <Navbar role="customer" activeCat="MY ORDERS" cats={ACCOUNT_CATS} />

      <div className="breadcrumb"><a onClick={() => navigate('home')} style={{cursor:'pointer'}}>Home</a> / <span style={{color:'var(--charcoal)'}}>My Orders</span></div>

      <div className="layout">
        <AccountSidebar activeKey="orders" navigate={navigate} />

        <div className="main">
          <div className="page-title" style={{marginBottom:'8px'}}>My Orders</div>

          {orders.length === 0 ? (
            <div style={{background:'#fff', border:'1px solid var(--border)', borderRadius:'6px', padding:'40px', textAlign:'center', color:'#888', fontSize:'13px'}}>
              No orders yet. <a onClick={() => navigate('home')} style={{color:'var(--green-deep)', cursor:'pointer', fontWeight:600}}>Start shopping →</a>
            </div>
          ) : (
            <div className="grid-2">
              {/* ORDER LIST */}
              <div>
                <div className="card-title" style={{marginBottom:'10px'}}>Recent Orders</div>
                {orders.map(o => {
                  const { label, cls } = statusTag(o.status);
                  const isActive = o.id === selected;
                  return (
                    <div
                      key={o.id}
                      className="card"
                      style={{marginBottom:'10px', borderLeft:`4px solid ${isActive ? 'var(--amber)' : 'transparent'}`, cursor:'pointer', opacity: isActive ? 1 : 0.8}}
                      onClick={() => setSelected(o.id)}
                    >
                      <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'4px'}}>
                        <div>
                          <div style={{fontWeight:700, fontSize:'13px'}}>Order #{o.id}</div>
                          <div style={{fontSize:'11px', color:'#888'}}>
                            {new Date(o.created_at).toLocaleDateString('en-GB', {day:'numeric',month:'short',year:'numeric'})} · £{parseFloat(o.total_price).toFixed(2)} · {o.fulfilment_type}
                          </div>
                        </div>
                        <span className={`tag ${cls}`}>{label}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* LIVE STATUS */}
              {selectedOrder && (
                <div className="card">
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
                    <div>
                      <div style={{fontWeight:700, fontSize:'14px'}}>Order #{selectedOrder.id}</div>
                      <div style={{fontSize:'11px', color:'#888', textTransform:'capitalize'}}>{selectedOrder.fulfilment_type}</div>
                    </div>
                    <span className={`tag ${statusTag(selectedOrder.status).cls}`}>{statusTag(selectedOrder.status).label}</span>
                  </div>
                  {selectedOrder.fulfilment_type === 'delivery' && selectedOrder.delivery_address_line1 && (
                    <div style={{background:'var(--cream-alt)', borderRadius:'6px', padding:'12px', marginBottom:'14px', fontSize:'12px'}}>
                      {selectedOrder.delivery_address_line1}, {selectedOrder.delivery_city}, {selectedOrder.delivery_postcode}
                    </div>
                  )}
                  <div className="card-title">Live Status</div>
                  <StatusTimeline items={buildTimeline(selectedOrder)} />
                  {detail?.items?.length > 0 && (
                    <>
                      <hr className="divider" />
                      <table>
                        <thead><tr><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
                        <tbody>
                          {detail.items.map(item => (
                            <tr key={item.id}>
                              <td>{item.product_name_snapshot}</td>
                              <td>{item.quantity}</td>
                              <td>£{parseFloat(item.unit_price).toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      <div style={{textAlign:'right', marginTop:'8px', fontWeight:700, color:'var(--green-deep)'}}>
                        Total: £{parseFloat(selectedOrder.total_price).toFixed(2)}
                        {selectedOrder.discount_applied > 0 && (
                          <span style={{fontSize:'11px', color:'var(--green)', marginLeft:'8px'}}>(-£{parseFloat(selectedOrder.discount_applied).toFixed(2)} discount)</span>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default OrderTrackingPage;
