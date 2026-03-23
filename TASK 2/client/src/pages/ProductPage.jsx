import { useState, useEffect } from 'react';
import '../styles/glh.css';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';
import api from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';

const ProductPage = () => {
  const { user } = useAuth();
  const { params, navigate } = useNavigation();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState('success');

  useEffect(() => {
    if (!params.productId) { navigate('home'); return; }
    api.get(`/products/${params.productId}`)
      .then(data => { setProduct(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [params.productId]);

  const handleAddToCart = async () => {
    if (!user) { navigate('login'); return; }
    try {
      await api.post('/cart', { productId: product.id, quantity: qty });
      setMsg('Added to basket!'); setMsgType('success');
    } catch (error) {
      setMsg(error.message || 'Could not add to basket'); setMsgType('error');
    }
    setTimeout(() => setMsg(''), 3000);
  };

  if (loading) return <div style={{padding:'60px', textAlign:'center', color:'#888'}}>Loading…</div>;
  if (!product) return <div style={{padding:'60px', textAlign:'center', color:'#888'}}>Product not found.</div>;

  const inStock = product.stock_quantity > 0;
  const price = `£${parseFloat(product.price).toFixed(2)}`;

  return (
    <div>
      <Navbar role="customer" activeCat={product.category || 'VEGETABLES'} />

      <div className="breadcrumb">
        <a onClick={() => navigate('home')} style={{cursor:'pointer'}}>Home</a> / <a onClick={() => navigate('home')} style={{cursor:'pointer'}}>{product.category || 'Products'}</a> / <span style={{color:'var(--charcoal)'}}>{product.name}</span>
      </div>

      <div className="layout">
        <Sidebar heading="Browse">
          <a className="sidebar-item" style={{cursor:'pointer'}} onClick={() => navigate('home')}>Home</a>
          <a className="sidebar-item" style={{cursor:'pointer'}} onClick={() => navigate('home')}>{product.category || 'Products'}</a>
          <a className="sidebar-item active" style={{paddingLeft:'24px'}}>↳ {product.name}</a>
        </Sidebar>

        <div style={{background:'#fff', padding:'24px'}}>
          {msg && (
            <div style={{
              background: msgType === 'success' ? '#e8f5e9' : '#fde8e6',
              color: msgType === 'success' ? 'var(--green-deep)' : 'var(--red)',
              border: `1px solid ${msgType === 'success' ? 'var(--border)' : '#f5c6c2'}`,
              borderRadius:'4px', padding:'10px 14px', marginBottom:'16px', fontSize:'13px'
            }}>{msg}</div>
          )}
          <div className="prod-detail">
            <div className="prod-gallery">
              <div style={{textAlign:'right', marginBottom:'6px'}}><button style={{background:'none', border:'none', fontSize:'20px', cursor:'pointer', color:'#ccc'}}>♡</button></div>
              <div className="prod-main-img" style={{overflow:'hidden', border:'1px solid var(--border)', borderRadius:'4px', height:'240px'}}>
                <img
                  src={product.image_url || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=600&h=400&fit=crop&auto=format'}
                  alt={product.name}
                  style={{width:'100%', height:'100%', objectFit:'cover'}}
                />
              </div>
              <div style={{fontSize:'11px', color:'#888', marginTop:'10px', lineHeight:1.5}}>
                From <strong>{product.farm_name || 'Local Farm'}</strong>
              </div>
            </div>

            <div className="prod-info">
              <div style={{fontFamily:"'Playfair Display',serif", fontSize:'18px', fontWeight:700, color:'var(--green-deep)', marginBottom:'8px'}}>{product.name}</div>
              <div style={{display:'flex', gap:'8px', marginBottom:'14px'}}>
                <span className={`tag ${inStock ? 'tag-green' : 'tag-red'}`}>{inStock ? 'In Stock' : 'Out of Stock'}</span>
                {product.category && <span className="tag">{product.category}</span>}
              </div>
              <div style={{fontSize:'24px', fontWeight:700, color:'var(--green-deep)', marginBottom:'16px'}}>{price}</div>
              <div style={{fontSize:'12px', color:'#777', lineHeight:1.7, marginBottom:'20px'}}>
                {product.description || 'Fresh, locally sourced produce.'}
              </div>

              {inStock && (
                <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'16px'}}>
                  <span className="qty-label" style={{fontSize:'13px'}}>Qty.</span>
                  <input
                    type="number" className="qty-input qty-input-detail" value={qty} min="1"
                    onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
                  />
                  <button className="btn btn-deep" style={{padding:'8px 24px', fontSize:'14px'}} onClick={handleAddToCart}>
                    Add to Basket
                  </button>
                </div>
              )}

              <hr className="divider" />
              <div style={{fontSize:'12px', color:'#777', lineHeight:1.8}}>
                <div><strong style={{color:'var(--charcoal)'}}>Farm:</strong> {product.farm_name || 'Local Farm'}</div>
                <div><strong style={{color:'var(--charcoal)'}}>Collection:</strong> Available Mon–Fri</div>
                <div><strong style={{color:'var(--charcoal)'}}>Delivery:</strong> Next available slot: Thu 19 – Sat 21 March</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductPage;
