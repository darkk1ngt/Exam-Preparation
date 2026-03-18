import { useState, useEffect } from 'react';
import '../styles/glh.css';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';

const ACCOUNT_CATS = ['SHOP', 'MY ORDERS', 'LOYALTY', 'ACCOUNT'];

const TIERS = [
  { name: 'Bronze',   min: 0,    max: 500  },
  { name: 'Silver',   min: 500,  max: 1500 },
  { name: 'Gold',     min: 1500, max: 3000 },
  { name: 'Platinum', min: 3000, max: Infinity },
];

function getTier(points) {
  return TIERS.find(t => points >= t.min && points < t.max) || TIERS[0];
}

const LoyaltyPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { navigate } = useNavigation();
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('login'); return; }
    fetch('/api/loyalty', { credentials: 'include' })
      .then(r => r.ok ? r.json() : null)
      .then(data => { setLoyalty(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, authLoading]);

  if (authLoading || loading) return <div style={{padding:'60px', textAlign:'center', color:'#888'}}>Loading…</div>;

  const points = loyalty?.points_balance ?? 0;
  const tier = getTier(points);
  const nextTier = TIERS[TIERS.indexOf(tier) + 1];
  const tierProgress = nextTier
    ? Math.min(100, ((points - tier.min) / (nextTier.min - tier.min)) * 100)
    : 100;

  return (
    <div>
      <Navbar role="customer" activeCat="LOYALTY" cats={ACCOUNT_CATS} />

      <div className="breadcrumb"><a onClick={() => navigate('home')} style={{cursor:'pointer'}}>Home</a> / <span style={{color:'var(--charcoal)'}}>Loyalty Rewards</span></div>

      <div className="layout">
        <Sidebar heading="My Account">
          <a className="sidebar-item" style={{cursor:'pointer'}} onClick={() => navigate('tracking')}>My Orders</a>
          <a className="sidebar-item active">Loyalty Points</a>
          <a className="sidebar-item">Account Details</a>
          <a className="sidebar-item" style={{cursor:'pointer'}} onClick={() => navigate('notifications')}>
            <svg style={{width:'17px',height:'17px',fill:'none',stroke:'#fff',strokeWidth:1.8}} viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> Notifications
          </a>
        </Sidebar>

        <div className="main">
          <div className="page-title" style={{marginBottom:'16px'}}>Loyalty Rewards</div>
          <div className="grid-2">
            <div>
              <div className="points-hero" style={{marginBottom:'16px'}}>
                <div style={{fontSize:'11px', opacity:0.7, textTransform:'uppercase', letterSpacing:'1px', marginBottom:'6px'}}>Your Balance</div>
                <div className="points-big">{points.toLocaleString()} <span style={{fontSize:'18px', opacity:0.6}}>pts</span></div>
                <div style={{fontSize:'12px', opacity:0.7, marginTop:'6px'}}>{tier.name} Tier</div>
                <div className="tier-bar"><div className="tier-fill" style={{width:`${tierProgress}%`}}></div></div>
                {nextTier ? (
                  <div style={{display:'flex', justifyContent:'space-between', fontSize:'10px', opacity:0.6}}>
                    <span>{tier.name} ({tier.min.toLocaleString()})</span>
                    <span>{(nextTier.min - points).toLocaleString()} to {nextTier.name} ({nextTier.min.toLocaleString()})</span>
                  </div>
                ) : (
                  <div style={{fontSize:'10px', opacity:0.6, textAlign:'center'}}>Maximum tier reached!</div>
                )}
              </div>
              <div className="card" style={{marginBottom:'16px'}}>
                <div className="card-title">Tier Benefits</div>
                <div style={{fontSize:'12px', lineHeight:2}}>
                  <div><span style={{color:'var(--green)'}}>✓</span> 5% discount on all orders</div>
                  <div><span style={{color:'var(--green)'}}>✓</span> Early access to seasonal items</div>
                  <div style={{color: tier.name === 'Gold' || tier.name === 'Platinum' ? 'inherit' : '#bbb'}}>
                    <span>{tier.name === 'Gold' || tier.name === 'Platinum' ? '✓' : '✗'}</span> Priority slots
                  </div>
                  <div style={{color: tier.name === 'Platinum' ? 'inherit' : '#bbb'}}>
                    <span>{tier.name === 'Platinum' ? '✓' : '✗'}</span> Free delivery (Platinum)
                  </div>
                </div>
              </div>
              <div className="card">
                <div className="card-title">Account Summary</div>
                <div style={{fontSize:'12px', lineHeight:2, color:'#555'}}>
                  <div><strong style={{color:'var(--charcoal)'}}>Points balance:</strong> {points.toLocaleString()} pts</div>
                  <div><strong style={{color:'var(--charcoal)'}}>Discount threshold:</strong> {loyalty?.discount_threshold ?? 100} pts</div>
                  <div><strong style={{color:'var(--charcoal)'}}>Earn rate:</strong> {loyalty?.points_rate ?? 1} pt per £1 spent</div>
                  {loyalty?.discount_active && (
                    <div style={{color:'var(--green-deep)', fontWeight:600}}>✓ Discount active on next order!</div>
                  )}
                </div>
              </div>
            </div>

            <div>
              <div className="card-title" style={{marginBottom:'10px'}}>Available Rewards</div>
              <div className="grid-2">
                {[
                  { label: '£2 off next order', pts: 200, icon: '🛒' },
                  { label: 'Free delivery',       pts: 500, icon: '🚚' },
                  { label: 'Mystery farm box',    pts: 1000, icon: '📦' },
                  { label: 'Gold tier upgrade',   pts: 1500, icon: '⭐' },
                ].map(r => {
                  const canRedeem = points >= r.pts;
                  return (
                    <div key={r.label} className="card" style={{textAlign:'center', padding:'14px', opacity: canRedeem ? 1 : 0.5}}>
                      <div style={{fontSize:'26px', marginBottom:'6px'}}>{r.icon}</div>
                      <div style={{fontWeight:600, fontSize:'12px', marginBottom:'4px'}}>{r.label}</div>
                      <div style={{color:'var(--green-deep)', fontSize:'11px', fontWeight:700, marginBottom:'10px'}}>{r.pts} pts</div>
                      <button
                        className={canRedeem ? 'btn btn-green btn-sm' : 'btn btn-sm'}
                        style={canRedeem ? {width:'100%'} : {width:'100%', background:'#f0f0f0', color:'#aaa'}}
                        disabled={!canRedeem}
                      >
                        {canRedeem ? 'Redeem' : `Need ${(r.pts - points).toLocaleString()} more`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoyaltyPage;
