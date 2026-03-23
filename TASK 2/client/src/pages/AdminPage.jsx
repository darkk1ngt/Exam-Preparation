import { useState, useEffect, useCallback } from 'react';
import '../styles/glh.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import api from '../api/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';

const AdminPage = () => {
  const { user, loading: authLoading } = useAuth();
  const { navigate } = useNavigation();
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');

  const fetchProducers = useCallback(() => {
    api.get('/admin/producers')
      .then(data => { setProducers(data.producers || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user || user.role !== 'admin') { navigate('login'); return; }
    fetchProducers();
  }, [user, authLoading]);

  const approve = async (id) => {
    try {
      await api.put(`/admin/producers/${id}/approve`);
      setMsg('Producer approved');
      fetchProducers();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Failed to approve producer');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  const reject = async (id) => {
    try {
      await api.put(`/admin/producers/${id}/reject`);
      setMsg('Producer rejected');
      fetchProducers();
      setTimeout(() => setMsg(''), 3000);
    } catch {
      setMsg('Failed to reject producer');
      setTimeout(() => setMsg(''), 3000);
    }
  };

  if (authLoading || loading) return <div style={{padding:'60px', textAlign:'center', color:'#888'}}>Loading…</div>;

  return (
    <div>
      <Navbar role="admin" notifCount={producers.length} activeCat="DASHBOARD" />

      {msg && (
        <div style={{background:'#e8f5e9', color:'var(--green-deep)', textAlign:'center', padding:'8px', fontSize:'13px', fontWeight:600, borderBottom:'1px solid var(--border)'}}>
          {msg}
        </div>
      )}

      {/* Two-column layout */}
      <div style={{display:'grid', gridTemplateColumns:'200px 1fr', minHeight:'70vh'}}>

        {/* Sidebar */}
        <div style={{background:'#fff', borderRight:'1px solid var(--border)', paddingBottom:'24px'}}>
          <div style={{background:'#6B4423', color:'#fff', fontSize:'12px', fontWeight:700, padding:'10px 16px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Administration</div>
          <a style={{display:'flex', alignItems:'center', padding:'8px 16px', fontSize:'12px', color:'var(--green-deep)', fontWeight:600, borderBottom:'1px solid #f0ede6', cursor:'pointer', background:'var(--cream-alt)', borderLeft:'3px solid var(--green-deep)'}}>Dashboard</a>
          <div style={{background:'var(--cream-alt)', padding:'8px 16px', fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px', color:'#888', fontWeight:700, borderBottom:'1px solid var(--border)', marginTop:'8px'}}>Management</div>
          <a style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 16px', fontSize:'12px', color:'var(--charcoal)', borderBottom:'1px solid #f0ede6', cursor:'pointer'}}>All Users</a>
          <a style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 16px', fontSize:'12px', color:'var(--charcoal)', borderBottom:'1px solid #f0ede6', cursor:'pointer'}}>All Orders</a>
          <a style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 16px', fontSize:'12px', color:'var(--charcoal)', borderBottom:'1px solid #f0ede6', cursor:'pointer'}}>Products</a>
          <a style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 16px', fontSize:'12px', color:'var(--charcoal)', borderBottom:'1px solid #f0ede6', cursor:'pointer'}}>
            Producers {producers.length > 0 && <span style={{background:'#f57c00', color:'#fff', fontSize:'9px', padding:'1px 5px', borderRadius:'10px'}}>{producers.length}</span>}
          </a>
          <div style={{background:'var(--cream-alt)', padding:'8px 16px', fontSize:'10px', textTransform:'uppercase', letterSpacing:'1px', color:'#888', fontWeight:700, borderBottom:'1px solid var(--border)', marginTop:'8px'}}>System</div>
          <a style={{display:'flex', alignItems:'center', padding:'8px 16px', fontSize:'12px', color:'var(--charcoal)', borderBottom:'1px solid #f0ede6', cursor:'pointer'}}>Audit Log</a>
          <a style={{display:'flex', alignItems:'center', padding:'8px 16px', fontSize:'12px', color:'var(--charcoal)', borderBottom:'1px solid #f0ede6', cursor:'pointer'}}>Settings</a>
        </div>

        {/* Main content */}
        <div style={{padding:'20px 24px', background:'#f3f4f6'}}>

          {/* Stat cards */}
          <div style={{display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px', marginBottom:'20px'}}>
            <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'6px', padding:'16px', textAlign:'center'}}><div style={{fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.8px', color:'#9ca3af', marginBottom:'8px'}}>Total Users</div><div style={{fontFamily:"'Playfair Display',serif", fontSize:'28px', fontWeight:700, color:'#111827'}}>—</div><div style={{fontSize:'11px', color:'#9ca3af', marginTop:'5px'}}>Live DB</div></div>
            <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'6px', padding:'16px', textAlign:'center'}}><div style={{fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.8px', color:'#9ca3af', marginBottom:'8px'}}>Orders Today</div><div style={{fontFamily:"'Playfair Display',serif", fontSize:'28px', fontWeight:700, color:'#111827'}}>—</div><div style={{fontSize:'11px', color:'#9ca3af', marginTop:'5px'}}>Live DB</div></div>
            <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'6px', padding:'16px', textAlign:'center'}}><div style={{fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.8px', color:'#9ca3af', marginBottom:'8px'}}>Revenue (Week)</div><div style={{fontFamily:"'Playfair Display',serif", fontSize:'28px', fontWeight:700, color:'#111827'}}>—</div><div style={{fontSize:'11px', color:'#9ca3af', marginTop:'5px'}}>Live DB</div></div>
            <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'6px', padding:'16px', textAlign:'center'}}><div style={{fontSize:'10px', textTransform:'uppercase', letterSpacing:'0.8px', color:'#9ca3af', marginBottom:'8px'}}>Pending Producers</div><div style={{fontFamily:"'Playfair Display',serif", fontSize:'28px', fontWeight:700, color:'#f57c00'}}>{producers.length}</div><div style={{fontSize:'11px', color:'#f57c00', marginTop:'5px'}}>Awaiting review</div></div>
          </div>

          {/* Producer approvals */}
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'6px', overflow:'hidden', marginBottom:'20px'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', borderBottom:'1px solid #e5e7eb'}}>
              <span style={{fontWeight:600, fontSize:'13px'}}>Producer Approvals</span>
              <span style={{background:'#fff8e1', color:'#f57c00', padding:'2px 7px', borderRadius:'10px', fontSize:'10px', fontWeight:600}}>
                {producers.length} Pending
              </span>
            </div>
            {producers.length === 0 ? (
              <div style={{padding:'24px', textAlign:'center', color:'#888', fontSize:'13px'}}>No pending applications.</div>
            ) : (
              producers.map((p, i) => (
                <div key={p.id} style={{padding:'14px 16px', borderBottom: i < producers.length - 1 ? '1px solid #f3f4f6' : 'none'}}>
                  <div style={{display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'8px'}}>
                    <div>
                      <div style={{fontWeight:600, fontSize:'12px'}}>{p.farm_name || p.email}</div>
                      <div style={{fontSize:'11px', color:'#888'}}>{p.email} · {p.contact_number || 'No phone'}</div>
                    </div>
                    <span style={{background:'#fff8e1', color:'#f57c00', padding:'2px 7px', borderRadius:'10px', fontSize:'10px', fontWeight:600}}>Pending</span>
                  </div>
                  <div style={{display:'flex', gap:'6px'}}>
                    <button style={{background:'var(--green)', color:'#fff', border:'none', padding:'4px 10px', borderRadius:'4px', fontSize:'11px', cursor:'pointer'}} onClick={() => approve(p.id)}>Approve</button>
                    <button style={{background:'#fde8e8', color:'#c0392b', border:'none', padding:'4px 10px', borderRadius:'4px', fontSize:'11px', cursor:'pointer'}} onClick={() => reject(p.id)}>Reject</button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* System Alerts */}
          <div style={{background:'#fff', border:'1px solid #e5e7eb', borderRadius:'6px', overflow:'hidden'}}>
            <div style={{padding:'14px 16px', borderBottom:'1px solid #e5e7eb', fontWeight:600, fontSize:'13px'}}>System Alerts</div>
            {producers.length > 0 && (
              <div style={{padding:'12px 16px', borderBottom:'1px solid #f9fafb', display:'flex', alignItems:'flex-start', gap:'10px'}}>
                <span style={{background:'#fde8e8', color:'#c0392b', padding:'2px 7px', borderRadius:'10px', fontSize:'10px', fontWeight:600, flexShrink:0, marginTop:'1px'}}>High</span>
                <div><div style={{fontSize:'12px', fontWeight:600}}>{producers.length} producer application{producers.length !== 1 ? 's' : ''} awaiting review</div><div style={{fontSize:'11px', color:'#888', marginTop:'2px'}}>Action required</div></div>
              </div>
            )}
            <div style={{padding:'12px 16px', display:'flex', alignItems:'flex-start', gap:'10px'}}>
              <span style={{background:'#e3f2fd', color:'#1565c0', padding:'2px 7px', borderRadius:'10px', fontSize:'10px', fontWeight:600, flexShrink:0, marginTop:'1px'}}>Info</span>
              <div><div style={{fontSize:'12px', fontWeight:600}}>Admin panel connected to live database</div><div style={{fontSize:'11px', color:'#888', marginTop:'2px'}}>All data reflects current state</div></div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AdminPage;
