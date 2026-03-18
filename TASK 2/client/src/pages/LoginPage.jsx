import { useState } from 'react';
import '../styles/glh.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { navigate } = useNavigation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Login failed');
      } else {
        login(data.user);
        if (data.user.role === 'producer') navigate('producer');
        else if (data.user.role === 'admin') navigate('admin');
        else navigate('home');
      }
    } catch {
      setError('Network error — check server is running');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar role="customer" />

      <div style={{maxWidth:'720px', margin:'40px auto', padding:'0 20px'}}>
        <div style={{textAlign:'center', marginBottom:'28px'}}>
          <div style={{fontFamily:"'Playfair Display',serif", fontSize:'22px', fontWeight:700, color:'var(--green-deep)'}}>Welcome — Please Sign In</div>
          <div style={{fontSize:'12px', color:'#888', marginTop:'4px'}}>Access your orders, loyalty points and account details</div>
        </div>

        {error && (
          <div style={{background:'#fde8e6', color:'var(--red)', border:'1px solid #f5c6c2', borderRadius:'4px', padding:'10px 14px', marginBottom:'16px', fontSize:'13px'}}>
            {error}
          </div>
        )}

        <div className="grid-2" style={{gap:0, background:'#fff', border:'1px solid var(--border)', borderRadius:'6px', overflow:'hidden'}}>
          {/* NEW CUSTOMER */}
          <div style={{padding:'28px', borderRight:'1px solid var(--border)'}}>
            <div style={{fontSize:'13px', fontWeight:700, color:'var(--green-deep)', marginBottom:'12px', borderBottom:'2px solid var(--green)', paddingBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px'}}>New Customer</div>
            <p style={{fontSize:'12px', color:'#666', lineHeight:1.6, marginBottom:'20px'}}>
              By creating an account you can shop faster, stay up to date on your order status, and keep track of previous orders.
            </p>
            <p style={{fontSize:'12px', color:'#555', marginBottom:'16px'}}>You'll also earn loyalty points on every order and access exclusive farm offers.</p>
            <a onClick={() => navigate('register')} style={{color:'var(--green-deep)', fontSize:'14px', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:'4px', cursor:'pointer'}}>
              Register ›
            </a>
          </div>

          {/* RETURNING CUSTOMER */}
          <form onSubmit={handleLogin} style={{padding:'28px'}}>
            <div style={{fontSize:'13px', fontWeight:700, color:'var(--green-deep)', marginBottom:'16px', borderBottom:'2px solid var(--green)', paddingBottom:'6px', textTransform:'uppercase', letterSpacing:'0.5px'}}>Returning Customer</div>
            <div style={{marginBottom:'12px'}}>
              <label style={{fontSize:'12px', color:'#555', display:'block', marginBottom:'4px'}}>E-Mail Address: <span className="req">*</span></label>
              <input type="email" className="form-input" style={{maxWidth:'100%', width:'100%'}} value={email} onChange={e => setEmail(e.target.value)} required />
            </div>
            <div style={{marginBottom:'14px'}}>
              <label style={{fontSize:'12px', color:'#555', display:'block', marginBottom:'4px'}}>Password: <span className="req">*</span></label>
              <input type="password" className="form-input" style={{maxWidth:'100%', width:'100%'}} value={password} onChange={e => setPassword(e.target.value)} required />
            </div>
            <a onClick={() => navigate('home')} style={{color:'var(--green-deep)', fontSize:'12px', display:'block', marginBottom:'20px', cursor:'pointer'}}>Forgot password?</a>
            <button type="submit" disabled={loading} style={{color:'var(--green-deep)', fontSize:'14px', fontWeight:700, textDecoration:'none', display:'flex', alignItems:'center', gap:'4px', background:'none', border:'none', cursor:'pointer', padding:0}}>
              {loading ? 'Signing in…' : 'Login ›'}
            </button>
          </form>
        </div>

        <div style={{background:'#fff', border:'1px solid var(--border)', borderRadius:'6px', padding:'18px', marginTop:'16px'}}>
          <div style={{fontSize:'13px', fontWeight:700, color:'var(--green-deep)', marginBottom:'6px'}}>About login / registration</div>
          <p style={{fontSize:'12px', color:'#666', lineHeight:1.6}}>
            You will need to create an account before placing an order. This allows you to shop faster, stay up to date on your order status, and keep track of your purchase history and loyalty points.
          </p>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default LoginPage;
