import { useState, useEffect } from 'react';
import '../styles/glh.css';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';

const HomePage = () => {
  const { user } = useAuth();
  const { params, navigate } = useNavigation();
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState(params.category || 'all');
  const [search, setSearch] = useState(params.search || '');
  const [loading, setLoading] = useState(true);
  const [cartMsg, setCartMsg] = useState('');

  // Sync filters when arriving via nav-cats or search bar
  useEffect(() => {
    setCategory(params.category || 'all');
    setSearch(params.search || '');
  }, [params.category, params.search]);

  useEffect(() => {
    setLoading(true);
    const qs = new URLSearchParams();
    if (category !== 'all') qs.set('category', category);
    if (search) qs.set('search', search);
    const url = `/api/products${qs.toString() ? '?' + qs.toString() : ''}`;
    fetch(url)
      .then(r => r.ok ? r.json() : { products: [] })
      .then(data => { setProducts(data.products || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [category, search]);

  const handleAddToCart = async (productId, qty) => {
    if (!user) { navigate('login'); return; }
    const res = await fetch('/api/cart', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ productId, quantity: qty }),
    });
    if (res.ok) {
      setCartMsg('Added to basket!');
      setTimeout(() => setCartMsg(''), 2000);
    }
  };

  const formatPrice = (p) => `£${parseFloat(p).toFixed(2)}`;

  return (
    <div>
      <Navbar role="customer" activeCat="NEW & SEASONAL" />

      <div className="nav-sub">
        <a href="#" className={category === 'all' ? 'active' : ''} onClick={e => { e.preventDefault(); setCategory('all'); }}>All</a>
        <a href="#" className={category === 'Root Veg' ? 'active' : ''} onClick={e => { e.preventDefault(); setCategory('Root Veg'); }}>Root Veg</a>
        <a href="#" className={category === 'Salad Leaves' ? 'active' : ''} onClick={e => { e.preventDefault(); setCategory('Salad Leaves'); }}>Salad Leaves</a>
        <a href="#" className={category === 'Brassicas' ? 'active' : ''} onClick={e => { e.preventDefault(); setCategory('Brassicas'); }}>Brassicas</a>
        <a href="#" className={category === 'Squash' ? 'active' : ''} onClick={e => { e.preventDefault(); setCategory('Squash'); }}>Squash</a>
        <a href="#" className={category === 'Alliums' ? 'active' : ''} onClick={e => { e.preventDefault(); setCategory('Alliums'); }}>Alliums</a>
        <a href="#" className={category === 'Legumes' ? 'active' : ''} onClick={e => { e.preventDefault(); setCategory('Legumes'); }}>Legumes</a>
        <a href="#" className={category === 'Heritage' ? 'active' : ''} onClick={e => { e.preventDefault(); setCategory('Heritage'); }}>Heritage Varieties</a>
      </div>

      {/* ── HERO ── */}
      <div style={{position:'relative', background:'#1a3a0e', overflow:'hidden', borderBottom:'1px solid #000'}}>
        <img
          src="https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=1400&h=280&fit=crop&auto=format"
          alt="Fresh farm produce"
          style={{width:'100%', height:'260px', objectFit:'cover', display:'block', opacity:0.45}}
        />
        <div style={{position:'absolute', inset:0, display:'flex', alignItems:'center', padding:'0 64px'}}>
          <div>
            <div style={{color:'#a8d88a', fontSize:'11px', fontWeight:700, textTransform:'uppercase', letterSpacing:'2.5px', marginBottom:'10px'}}>Spring 2026 · Now in season</div>
            <div style={{fontFamily:"'Playfair Display',serif", fontSize:'38px', fontWeight:700, color:'#fff', lineHeight:1.1, marginBottom:'12px'}}>Farm-fresh produce,<br/>direct to your door</div>
            <div style={{color:'rgba(255,255,255,0.8)', fontSize:'13px', lineHeight:1.7, marginBottom:'22px'}}>Sourced directly from local British farms. No middlemen, no compromise.</div>
            <button style={{background:'#fff', color:'var(--green-deep)', border:'none', padding:'10px 28px', borderRadius:'4px', fontSize:'13px', fontWeight:700, cursor:'pointer', marginRight:'10px'}}>Shop Now</button>
            <button style={{background:'transparent', color:'#fff', border:'2px solid rgba(255,255,255,0.5)', padding:'10px 24px', borderRadius:'4px', fontSize:'13px', fontWeight:600, cursor:'pointer'}}>View All Offers</button>
          </div>
        </div>
      </div>

      {cartMsg && (
        <div style={{background:'#e8f5e9', color:'var(--green-deep)', textAlign:'center', padding:'8px', fontSize:'13px', fontWeight:600, borderBottom:'1px solid var(--border)'}}>
          {cartMsg}
        </div>
      )}

      <div className="layout">
        <Sidebar heading="Product Categories ◂">
          <a className={`sidebar-item ${category === 'all' ? 'active' : ''}`} style={{cursor:'pointer'}} onClick={() => setCategory('all')}>All Products</a>
          <a className={`sidebar-item ${category === 'Vegetables' ? 'active' : ''}`} style={{cursor:'pointer'}} onClick={() => setCategory('Vegetables')}>Vegetables</a>
          <a className={`sidebar-item ${category === 'New & Seasonal' ? 'active' : ''}`} style={{cursor:'pointer'}} onClick={() => setCategory('New & Seasonal')}>New &amp; Seasonal</a>
          <a className={`sidebar-item ${category === 'Fruit' ? 'active' : ''}`} style={{cursor:'pointer'}} onClick={() => setCategory('Fruit')}>Fruit</a>
          <a className={`sidebar-item ${category === 'Dairy & Eggs' ? 'active' : ''}`} style={{cursor:'pointer'}} onClick={() => setCategory('Dairy & Eggs')}>Dairy &amp; Eggs</a>
          <a className={`sidebar-item ${category === 'Bakery' ? 'active' : ''}`} style={{cursor:'pointer'}} onClick={() => setCategory('Bakery')}>Bakery</a>
          <a className={`sidebar-item ${category === 'Preserves' ? 'active' : ''}`} style={{cursor:'pointer'}} onClick={() => setCategory('Preserves')}>Preserves &amp; Honey</a>
          <a className={`sidebar-item ${category === 'Herbs' ? 'active' : ''}`} style={{cursor:'pointer'}} onClick={() => setCategory('Herbs')}>Herbs &amp; Flowers</a>

          <div className="sidebar-section">Filters</div>
          <div className="filter-item"><input type="checkbox" defaultChecked /> In Stock Only</div>
          <div className="filter-item"><input type="checkbox" /> Organic</div>
          <div className="filter-item"><input type="checkbox" /> Collection Only</div>
          <div className="filter-item"><input type="checkbox" /> Under £2</div>
          <div className="filter-item"><input type="checkbox" /> New This Week</div>
        </Sidebar>

        <div className="main">
          <div className="breadcrumb" style={{padding:0, background:'none', border:'none', marginBottom:'12px'}}>
            <a href="#">Home</a> / <span style={{color:'var(--charcoal)'}}>Products</span>
            <span style={{color:'#999', marginLeft:'8px'}}>({products.length} products)</span>
          </div>
          <div className="page-title">Products</div>
          <div className="page-desc">
            Fresh produce sourced directly from local farms. <strong>Everything shown is currently in stock</strong> and available for collection or delivery.
          </div>

          {loading ? (
            <div style={{padding:'40px', textAlign:'center', color:'#888', fontSize:'13px'}}>Loading products…</div>
          ) : products.length === 0 ? (
            <div style={{padding:'40px', textAlign:'center', color:'#888', fontSize:'13px'}}>No products found in this category.</div>
          ) : (
            <div className="product-grid">
              {products.map(p => (
                <ProductCard
                  key={p.id}
                  img={p.image_url || 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=320&h=200&fit=crop&auto=format'}
                  name={p.name}
                  farm={p.farm_name || 'Local Farm'}
                  weight={p.description ? p.description.substring(0, 20) : ''}
                  price={formatPrice(p.price)}
                  outOfStock={p.stock_quantity <= 0}
                  onClick={() => navigate('product', { productId: p.id })}
                  onAdd={(qty) => handleAddToCart(p.id, qty)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default HomePage;
