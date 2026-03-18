import { useState, useEffect } from 'react';
import '../styles/glh.css';
import Navbar from '../components/Navbar.jsx';
import Sidebar from '../components/Sidebar.jsx';
import Footer from '../components/Footer.jsx';
import NotifItem from '../components/NotifItem.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';

const NOTIF_CATS = ['SHOP', 'MY ORDERS', 'LOYALTY', 'NOTIFICATIONS'];

const GreenIcon  = () => <div className="notif-icon" style={{background:'#e8f5e9'}}></div>;
const BlueIcon   = () => <div className="notif-icon" style={{background:'#e8f0fe'}}></div>;
const AmberIcon  = () => (
  <div className="notif-icon" style={{background:'#fff8e1', width:'30px', height:'30px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center'}}>
    <svg style={{width:'14px',height:'14px',fill:'none',stroke:'#f57c00',strokeWidth:2}} viewBox="0 0 24 24">
      <path d="M17 8C8 10 5.9 16.17 3.82 19.34a1 1 0 001.77.14C7 17 11 12 21 10c-1.41 2.31-3.72 4.39-7 6"/>
    </svg>
  </div>
);

function iconForType(type) {
  if (type === 'order_update') return <GreenIcon />;
  if (type === 'product_available') return <AmberIcon />;
  return <BlueIcon />;
}

function tagForType(type) {
  if (type === 'order_update') return { tag: 'Order', tagClass: 'tag-green' };
  if (type === 'product_available') return { tag: 'Product', tagClass: 'tag-amber' };
  return { tag: 'Loyalty', tagClass: 'tag-blue' };
}

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  return new Date(dateStr).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

const NotificationsPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { navigate } = useNavigation();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (authLoading) return;
    if (!user) { navigate('login'); return; }
    fetch('/api/notifications', { credentials: 'include' })
      .then(r => r.ok ? r.json() : { notifications: [] })
      .then(data => { setNotifications(data.notifications || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user, authLoading]);

  const markAllRead = async () => {
    await fetch('/api/notifications/read-all', { method: 'PUT', credentials: 'include' });
    setNotifications(n => n.map(item => ({ ...item, is_read: true })));
  };

  const markRead = async (id) => {
    await fetch(`/api/notifications/${id}/read`, { method: 'PUT', credentials: 'include' });
    setNotifications(n => n.map(item => item.id === id ? { ...item, is_read: true } : item));
  };

  if (authLoading || loading) return <div style={{padding:'60px', textAlign:'center', color:'#888'}}>Loading…</div>;

  const unread = notifications.filter(n => !n.is_read);
  const read   = notifications.filter(n => n.is_read);

  return (
    <div>
      <Navbar role="customer" notifCount={unreadCount} activeCat="NOTIFICATIONS" cats={NOTIF_CATS} />

      <div className="breadcrumb" style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <span><a onClick={() => navigate('home')} style={{cursor:'pointer'}}>Home</a> / <span style={{color:'var(--charcoal)'}}>Notifications</span></span>
        {unreadCount > 0 && (
          <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark all as read</button>
        )}
      </div>

      <div className="layout">
        <Sidebar heading="My Account">
          <a className="sidebar-item" style={{cursor:'pointer'}} onClick={() => navigate('tracking')}>My Orders</a>
          <a className="sidebar-item" style={{cursor:'pointer'}} onClick={() => navigate('loyalty')}>Loyalty Points</a>
          <a className="sidebar-item">Account Details</a>
          <a className="sidebar-item active">
            <svg style={{width:'17px',height:'17px',fill:'none',stroke:'#fff',strokeWidth:1.8}} viewBox="0 0 24 24"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg> Notifications
          </a>
        </Sidebar>

        <div className="main">
          <div className="page-title" style={{marginBottom:'12px'}}>Notifications</div>

          {notifications.length === 0 ? (
            <div style={{background:'#fff', border:'1px solid var(--border)', borderRadius:'6px', padding:'40px', textAlign:'center', color:'#888', fontSize:'13px'}}>
              No notifications yet.
            </div>
          ) : (
            <div style={{background:'#fff', border:'1px solid var(--border)', borderRadius:'6px', overflow:'hidden', marginBottom:'20px'}}>
              {unread.length > 0 && (
                <>
                  <div style={{padding:'8px 16px', background:'var(--cream-alt)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px', color:'#888', fontWeight:700, borderBottom:'1px solid var(--border)'}}>Unread ({unread.length})</div>
                  {unread.map(n => {
                    const { tag, tagClass } = tagForType(n.type);
                    return (
                      <NotifItem
                        key={n.id}
                        icon={iconForType(n.type)}
                        title={n.message}
                        body={n.order_id ? `Order #${n.order_id}` : ''}
                        time={timeAgo(n.created_at)}
                        tag={tag} tagClass={tagClass}
                        unread
                        onClick={() => markRead(n.id)}
                      />
                    );
                  })}
                </>
              )}
              {read.length > 0 && (
                <>
                  <div style={{padding:'8px 16px', background:'var(--cream-alt)', fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px', color:'#888', fontWeight:700, borderTop: unread.length > 0 ? '1px solid var(--border)' : 'none', borderBottom:'1px solid var(--border)'}}>Earlier</div>
                  {read.map((n, i) => {
                    const { tag, tagClass } = tagForType(n.type);
                    return (
                      <NotifItem
                        key={n.id}
                        icon={iconForType(n.type)}
                        title={n.message}
                        body={n.order_id ? `Order #${n.order_id}` : ''}
                        time={timeAgo(n.created_at)}
                        tag={tag} tagClass={tagClass}
                        style={{opacity:0.7, ...(i === read.length - 1 ? {borderBottom:'none'} : {})}}
                      />
                    );
                  })}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default NotificationsPage;
