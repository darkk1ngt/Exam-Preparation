import { useState, useEffect, useCallback } from 'react';
import '../styles/glh.css';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';
import api from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';

const ProducerDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { navigate } = useNavigation();
  const [overview, setOverview] = useState(null);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMsg, setStatusMsg] = useState('');

  const fetchAll = useCallback(async () => {
    try {
      const [ov, pr, or_] = await Promise.all([
        api.get('/dashboard/overview'),
        api.get('/dashboard/products'),
        api.get('/dashboard/orders'),
      ]);
      if (ov) setOverview(ov);
      if (pr?.products) setProducts(pr.products);
      if (or_?.orders) setOrders(or_.orders);
    } catch (err) {
      setStatusMsg(err.message || 'Failed to load dashboard data');
      setTimeout(() => setStatusMsg(''), 3000);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'producer') { navigate('login'); return; }
    fetchAll();
  }, [user, authLoading]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      await api.put(`/dashboard/orders/${orderId}/status`, { status });
      setStatusMsg(`Order #${orderId} updated to ${status}`);
      setTimeout(() => setStatusMsg(''), 3000);
      fetchAll();
    } catch {
      setStatusMsg(`Failed to update Order #${orderId}`);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  if (authLoading || loading) return <div style={{padding:'60px', textAlign:'center', color:'#888'}}>Loading…</div>;

  const pending = orders.filter(o => ['pending','confirmed'].includes(o.status));
  const stockLow = products.filter(p => p.stock_quantity < 5 && p.stock_quantity > 0);
  const stockOut  = products.filter(p => p.stock_quantity === 0);

  return (
    <div>
      <Navbar role="producer" notifCount={pending.length} activeCat="DASHBOARD" />

      <div style={{background:'linear-gradient(135deg, var(--brown), #8b5a2b)', padding:'18px 24px', color:'#fff', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <div>
          <div style={{fontSize:'11px', opacity:0.6, marginBottom:'2px'}}>Welcome back,</div>
          <div style={{fontFamily:"'Playfair Display',serif", fontSize:'18px', fontWeight:700}}>{user.farm_name || user.email}</div>
          <div style={{fontSize:'11px', opacity:0.6, marginTop:'2px'}}>{pending.length} new order{pending.length !== 1 ? 's' : ''} to action</div>
        </div>
        <button className="btn btn-white btn-sm">+ Add Product</button>
      </div>

      {statusMsg && (
        <div style={{background:'#e8f5e9', color:'var(--green-deep)', textAlign:'center', padding:'8px', fontSize:'13px', fontWeight:600, borderBottom:'1px solid var(--border)'}}>
          {statusMsg}
        </div>
      )}

      <div className="layout" style={{gridTemplateColumns:'200px 1fr'}}>
        <Sidebar>
          <div className="sidebar-section">Overview</div>
          <a className="sidebar-item active">Dashboard</a>
          <a className="sidebar-item">
            Orders {pending.length > 0 && <span style={{background:'var(--brown)', color:'#fff', fontSize:'9px', padding:'1px 6px', borderRadius:'8px', marginLeft:'auto'}}>{pending.length}</span>}
          </a>
          <div className="sidebar-section">Products</div>
          <a className="sidebar-item">My Products</a>
          {(stockLow.length > 0 || stockOut.length > 0) && (
            <a className="sidebar-item">
              Stock Alerts <span style={{background:'#e67e22', color:'#fff', fontSize:'9px', padding:'1px 6px', borderRadius:'8px', marginLeft:'auto'}}>{stockLow.length + stockOut.length}</span>
            </a>
          )}
          <div className="sidebar-section">Account</div>
          <a className="sidebar-item">Settings</a>
        </Sidebar>

        <div className="main">
          {/* STATS */}
          <div className="grid-4" style={{marginBottom:'20px'}}>
            <div className="stat-card"><div className="stat-num">{overview?.product_count ?? 0}</div><div className="stat-label">Active Products</div></div>
            <div className="stat-card"><div className="stat-num">{overview?.pending_orders ?? 0}</div><div className="stat-label">Pending Orders</div></div>
            <div className="stat-card"><div className="stat-num">£{parseFloat(overview?.weekly_revenue ?? 0).toFixed(0)}</div><div className="stat-label">Revenue This Week</div></div>
            <div className="stat-card"><div className="stat-num">{overview?.low_stock_count ?? 0}</div><div className="stat-label">Low Stock Items</div></div>
          </div>

          {/* PRODUCTS TABLE */}
          <div className="card" style={{marginBottom:'16px'}}>
            <div style={{display:'flex', justifyContent:'space-between', marginBottom:'12px'}}>
              <div className="card-title" style={{marginBottom:0}}>My Products</div>
              <button className="btn btn-deep btn-sm">+ Add New</button>
            </div>
            {products.length === 0 ? (
              <div style={{fontSize:'13px', color:'#888', padding:'16px 0'}}>No products yet.</div>
            ) : (
              <table>
                <thead><tr><th>Product</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {products.map(p => (
                    <tr key={p.id}>
                      <td><strong>{p.name}</strong></td>
                      <td>£{parseFloat(p.price).toFixed(2)}</td>
                      <td>
                        {p.stock_quantity}
                        {p.stock_quantity === 0 && ' ⛔'}
                        {p.stock_quantity > 0 && p.stock_quantity < 5 && ' ⚠️'}
                      </td>
                      <td>
                        {p.stock_quantity === 0
                          ? <span className="tag tag-red">Out of Stock</span>
                          : p.stock_quantity < 5
                          ? <span className="tag tag-amber">Low Stock</span>
                          : <span className="tag tag-green">Available</span>}
                      </td>
                      <td><button className="btn btn-outline btn-sm">Edit</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* INCOMING ORDERS */}
          <div className="card">
            <div className="card-title" style={{marginBottom:'12px'}}>Incoming Orders</div>
            {orders.length === 0 ? (
              <div style={{fontSize:'13px', color:'#888', padding:'8px 0'}}>No orders yet.</div>
            ) : (
              <table>
                <thead><tr><th>Order ID</th><th>Total</th><th>Type</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {orders.map(o => (
                    <tr key={o.id}>
                      <td>#{o.id}</td>
                      <td>£{parseFloat(o.total_price).toFixed(2)}</td>
                      <td style={{textTransform:'capitalize'}}>{o.fulfilment_type}</td>
                      <td>
                        {o.status === 'pending'   && <span className="tag tag-amber">Pending</span>}
                        {o.status === 'confirmed' && <span className="tag tag-blue">Confirmed</span>}
                        {o.status === 'ready'     && <span className="tag tag-green">Ready</span>}
                        {!['pending','confirmed','ready'].includes(o.status) && (
                          <span className="tag">{o.status}</span>
                        )}
                      </td>
                      <td style={{display:'flex', gap:'4px', flexWrap:'wrap'}}>
                        {o.status === 'pending' && (
                          <>
                            <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'confirmed')}>Accept</button>
                            <button className="btn btn-sm btn-danger" onClick={() => updateOrderStatus(o.id, 'cancelled')}>Decline</button>
                          </>
                        )}
                        {o.status === 'confirmed' && (
                          <button className="btn btn-deep btn-sm" onClick={() => updateOrderStatus(o.id, 'ready')}>Mark Ready</button>
                        )}
                        {o.status === 'ready' && (
                          <button className="btn btn-green btn-sm" onClick={() => updateOrderStatus(o.id, 'collected')}>Mark Collected</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProducerDashboardPage;
