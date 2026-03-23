import { useState } from 'react';
import '../styles/glh.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import api from '../api/api.js';
import { useNavigation } from '../context/NavigationContext.jsx';

const ResetPasswordPage = () => {
  const { params, navigate } = useNavigation();
  const token = params.token || '';

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { setError('Passwords do not match.'); return; }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/reset-password', { token, newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err.message || 'Network error — check server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar role="customer" />

      <div style={{ maxWidth: '480px', margin: '60px auto', padding: '0 20px 60px' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '20px', textAlign: 'center' }}>
          Set New Password
        </div>

        {!token ? (
          <div style={{ background: '#fde8e6', color: 'var(--red)', border: '1px solid #f5c6c2', borderRadius: '6px', padding: '20px', textAlign: 'center', fontSize: '13px' }}>
            Invalid or missing reset token.
            <br />
            <button className="btn btn-deep" style={{ marginTop: '14px' }} onClick={() => navigate('forgot-password')}>Request a new link ›</button>
          </div>
        ) : done ? (
          <div style={{ background: '#e8f5e9', border: '1px solid var(--border)', borderRadius: '6px', padding: '28px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>✓</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '8px' }}>Password updated!</div>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '20px' }}>You can now log in with your new password.</p>
            <button className="btn btn-deep" onClick={() => navigate('login')}>Go to Login ›</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '28px' }}>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px', lineHeight: 1.6 }}>
              Enter your new password below. It must be at least 8 characters and include a number and uppercase letter.
            </p>

            {error && (
              <div style={{ background: '#fde8e6', color: 'var(--red)', border: '1px solid #f5c6c2', borderRadius: '4px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>
                New Password <span className="req">*</span>
              </label>
              <input
                type="password"
                className="form-input"
                style={{ width: '100%', maxWidth: '100%' }}
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>
                Confirm Password <span className="req">*</span>
              </label>
              <input
                type="password"
                className="form-input"
                style={{ width: '100%', maxWidth: '100%' }}
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <a onClick={() => navigate('login')} style={{ color: 'var(--green-deep)', fontSize: '12px', cursor: 'pointer' }}>
                ← Back to Login
              </a>
              <button type="submit" className="btn btn-deep" style={{ padding: '9px 24px', fontSize: '13px' }} disabled={loading}>
                {loading ? 'Saving…' : 'Set Password ›'}
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ResetPasswordPage;
