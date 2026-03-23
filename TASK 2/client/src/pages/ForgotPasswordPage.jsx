import { useState } from 'react';
import '../styles/glh.css';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import api from '../api/api.js';
import { useNavigation } from '../context/NavigationContext.jsx';

const ForgotPasswordPage = () => {
  const { navigate } = useNavigation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/forgot-password', { email });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Network error — check server is running');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Navbar role="customer" />

      <div style={{ maxWidth: '480px', margin: '60px auto', padding: '0 20px 60px' }}>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '22px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '20px', textAlign: 'center' }}>
          Reset Your Password
        </div>

        {submitted ? (
          <div style={{ background: '#e8f5e9', border: '1px solid var(--border)', borderRadius: '6px', padding: '28px', textAlign: 'center' }}>
            <div style={{ fontSize: '32px', marginBottom: '10px' }}>✓</div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '8px' }}>Check your server console</div>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '20px', lineHeight: 1.6 }}>
              A password reset link has been logged to the server terminal. Open it to reset your password.
            </p>
            <button className="btn btn-deep" onClick={() => navigate('login')}>Back to Login ›</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid var(--border)', borderRadius: '6px', padding: '28px' }}>
            <p style={{ fontSize: '13px', color: '#666', marginBottom: '20px', lineHeight: 1.6 }}>
              Enter the email address associated with your account and we'll send you a reset link.
            </p>

            {error && (
              <div style={{ background: '#fde8e6', color: 'var(--red)', border: '1px solid #f5c6c2', borderRadius: '4px', padding: '10px 14px', marginBottom: '16px', fontSize: '13px' }}>
                {error}
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', color: '#555', display: 'block', marginBottom: '4px' }}>
                E-Mail Address <span className="req">*</span>
              </label>
              <input
                type="email"
                className="form-input"
                style={{ width: '100%', maxWidth: '100%' }}
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
              <a onClick={() => navigate('login')} style={{ color: 'var(--green-deep)', fontSize: '12px', cursor: 'pointer' }}>
                ← Back to Login
              </a>
              <button type="submit" className="btn btn-deep" style={{ padding: '9px 24px', fontSize: '13px' }} disabled={loading}>
                {loading ? 'Sending…' : 'Send Reset Link ›'}
              </button>
            </div>
          </form>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default ForgotPasswordPage;
