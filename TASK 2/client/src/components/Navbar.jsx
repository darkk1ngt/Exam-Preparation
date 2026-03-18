import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';

const SearchSvg = () => (
  <svg style={{width:'14px',height:'14px',fill:'none',stroke:'rgba(255,255,255,0.6)',strokeWidth:2,flexShrink:0}} viewBox="0 0 24 24">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>
);

const BellSvg = () => (
  <svg style={{width:'17px',height:'17px',fill:'none',stroke:'#fff',strokeWidth:1.8}} viewBox="0 0 24 24">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);

const CartSvg = () => (
  <svg style={{width:'20px',height:'20px',fill:'none',stroke:'rgba(255,255,255,0.85)',strokeWidth:1.8}} viewBox="0 0 24 24">
    <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/>
  </svg>
);

const DEFAULT_CATS = {
  customer: ['NEW & SEASONAL','VEGETABLES','FRUIT','DAIRY & EGGS','BAKERY','PRESERVES','HERBS','OFFERS'],
  producer: ['DASHBOARD','MY PRODUCTS','INCOMING ORDERS','ANALYTICS','PROFILE'],
  admin:    ['DASHBOARD','USERS','ORDERS','PRODUCTS','PRODUCERS','REPORTS','SETTINGS'],
};

/* Maps nav-cat labels to the category value the API expects */
const CAT_LABEL_TO_FILTER = {
  'NEW & SEASONAL': 'New & Seasonal',
  'VEGETABLES':     'Vegetables',
  'FRUIT':          'Fruit',
  'DAIRY & EGGS':   'Dairy & Eggs',
  'BAKERY':         'Bakery',
  'PRESERVES':      'Preserves',
  'HERBS':          'Herbs',
  'OFFERS':         'Offers',
};

function Navbar({ role = 'customer', notifCount = 0, activeCat = null, cats = null }) {
  const { user, logout } = useAuth();
  const { navigate } = useNavigation();
  const [cartCount, setCartCount] = useState(0);

  const loggedIn = !!user;

  const refreshCart = () => {
    if (!user || role !== 'customer') return;
    fetch('/api/cart', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => {
        if (data?.items) {
          const count = data.items.reduce((s, i) => s + i.quantity, 0);
          setCartCount(count);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    refreshCart();
    window.addEventListener('cartUpdated', refreshCart);
    return () => window.removeEventListener('cartUpdated', refreshCart);
  }, [user, role]);

  const handleLogout = async () => {
    await logout();
    navigate('home');
  };

  const displayName = user
    ? (role === 'producer' ? (user.farm_name || user.email) : user.email.split('@')[0])
    : null;

  /* ── PRODUCER ─────────────────────────────────────────── */
  if (role === 'producer') {
    const catList = cats || DEFAULT_CATS.producer;
    return (
      <>
        <div className="nav-top producer">
          <div className="brand" style={{cursor:'pointer'}} onClick={() => navigate('producer')}>
            Greenfield<span style={{color:'#d4a57a'}}>Local</span>Hub{' '}
            <span style={{fontSize:'11px',opacity:0.6,fontFamily:"'DM Sans',sans-serif",fontWeight:400,marginLeft:'6px'}}>Producer Portal</span>
          </div>
          <div className="nav-actions">
            <div className="notif-wrap">
              <button className="notif-btn" style={{background:'rgba(255,255,255,0.15)'}}><BellSvg /></button>
              {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
            </div>
            <a className="nav-link" style={{cursor:'pointer'}}>{displayName || 'My Farm'}</a>
            <span className="tag" style={{background:'rgba(107,68,35,0.4)',color:'#d4a57a',fontSize:'11px',padding:'3px 9px',borderRadius:'10px'}}>Producer</span>
            <button onClick={handleLogout} className="nav-link" style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:'12px',padding:'0 16px'}}>Logout</button>
          </div>
        </div>
        <nav className="nav-cats" style={{borderBottomColor:'#4A7C2F'}}>
          {catList.map(label => (
            <a key={label} href="#"
              className={activeCat === label ? 'active' : ''}
              style={{cursor:'pointer', ...(activeCat === label ? {background:'#4A7C2F',color:'#fff'} : {})}}
              onClick={e => { e.preventDefault(); navigate('producer'); }}
            >{label}</a>
          ))}
        </nav>
      </>
    );
  }

  /* ── ADMIN ────────────────────────────────────────────── */
  if (role === 'admin') {
    const catList = cats || DEFAULT_CATS.admin;
    return (
      <>
        <div className="nav-top" style={{background:'#6B4423'}}>
          <div className="brand" style={{fontSize:'18px', cursor:'pointer'}} onClick={() => navigate('admin')}>
            Greenfield<span style={{color:'rgba(255,255,255,0.65)'}}>Local</span>Hub{' '}
            <span style={{fontFamily:"'DM Sans',sans-serif",fontSize:'11px',fontWeight:400,color:'rgba(255,255,255,0.6)',marginLeft:'8px'}}>Admin Panel</span>
          </div>
          <div style={{display:'flex',alignItems:'center',background:'rgba(255,255,255,0.1)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:'6px',padding:'0 10px',gap:'6px',height:'34px'}}>
            <svg style={{width:'14px',height:'14px',fill:'none',stroke:'rgba(255,255,255,0.5)',strokeWidth:2,flexShrink:0}} viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search users, orders, products..." style={{background:'none',border:'none',outline:'none',color:'#fff',width:'200px',fontFamily:"'DM Sans',sans-serif",fontSize:'12px'}} />
          </div>
          <div className="nav-actions">
            <div className="notif-wrap">
              <button className="notif-btn"><BellSvg /></button>
              {notifCount > 0 && <span className="notif-badge">{notifCount}</span>}
            </div>
            <a className="nav-link" style={{cursor:'pointer'}}>{displayName || 'Admin'}</a>
            <span className="tag tag-red" style={{fontSize:'10px',padding:'3px 9px'}}>Administrator</span>
            <button onClick={handleLogout} className="nav-link" style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:'12px',padding:'0 16px'}}>Logout</button>
          </div>
        </div>
        <nav className="nav-cats" style={{borderBottomColor:'#6B4423'}}>
          {catList.map(label => (
            <a key={label} href="#"
              className={activeCat === label ? 'active' : ''}
              style={{cursor:'pointer', ...(activeCat === label ? {background:'#6B4423',color:'#fff'} : {})}}
              onClick={e => { e.preventDefault(); navigate('admin'); }}
            >{label}</a>
          ))}
        </nav>
      </>
    );
  }

  /* ── CUSTOMER (default) ───────────────────────────────── */
  const catList = cats || DEFAULT_CATS.customer;
  return (
    <>
      <div className="announce-bar">
        <span>🌱 Under 30? <strong>10% off all your orders</strong></span>
        <span>🚚 Next slots: <strong>Thu 19 – Sat 21 March</strong></span>
        <span>⭐ Trustpilot <strong>Excellent 4.7 / 5</strong> · 2,026 reviews</span>
      </div>
      <div className="nav-top">
        <div className="brand" style={{cursor:'pointer'}} onClick={() => navigate('home', {})}>Greenfield<span>Local</span>Hub</div>
        <div className="search-wrap">
          <SearchSvg />
          <input
            type="text"
            placeholder="Search for products"
            onKeyDown={e => {
              if (e.key === 'Enter' && e.target.value.trim()) {
                navigate('home', { search: e.target.value.trim() });
                e.target.value = '';
              }
            }}
          />
        </div>
        <div className="nav-actions">
          {notifCount > 0 && (
            <div className="notif-wrap">
              <button className="notif-btn" onClick={() => navigate('notifications')}><BellSvg /></button>
              <span className="notif-badge">{notifCount}</span>
            </div>
          )}
          {loggedIn ? (
            <>
              <a onClick={() => navigate('tracking')} className="nav-link" style={{cursor:'pointer'}}>{displayName}</a>
              <button onClick={handleLogout} className="nav-link" style={{background:'none',border:'none',cursor:'pointer',color:'rgba(255,255,255,0.7)',fontSize:'12px',padding:'0 16px'}}>Logout</button>
              <div className="nav-cart" style={{cursor:'pointer',position:'relative'}} onClick={() => navigate('cart')}>
                <CartSvg />
                {cartCount > 0 && (
                  <span style={{position:'absolute',top:'-7px',right:'-7px',background:'#e53935',color:'#fff',fontSize:'10px',fontWeight:700,minWidth:'17px',height:'17px',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',lineHeight:1,padding:'0 3px'}}>
                    {cartCount}
                  </span>
                )}
              </div>
            </>
          ) : (
            <>
              <a onClick={() => navigate('register')} className="nav-link" style={{cursor:'pointer'}}>REGISTER</a>
              <a onClick={() => navigate('login')} className="nav-link" style={{cursor:'pointer'}}>LOGIN</a>
              <div className="nav-cart">
                <CartSvg />
              </div>
            </>
          )}
        </div>
      </div>
      <nav className="nav-cats">
        {catList.map(label => (
          <a key={label} href="#"
            className={activeCat === label ? 'active' : ''}
            style={{cursor:'pointer'}}
            onClick={e => {
              e.preventDefault();
              navigate('home', { category: CAT_LABEL_TO_FILTER[label] || label });
            }}
          >{label}</a>
        ))}
      </nav>
    </>
  );
}

export default Navbar;
