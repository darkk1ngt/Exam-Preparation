import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import api from '../api/api.js';
import { useNavigation } from '../context/NavigationContext.jsx';

const VerifyEmailPage = () => {
  const { params, navigate } = useNavigation();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');
  const [resendEmail, setResendEmail] = useState(params?.email || '');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const token = params?.token;
      if (!token) {
        setStatus('error');
        setMessage('No verification token found.');
        return;
      }

      try {
        await api.get(`/auth/verify-email?token=${encodeURIComponent(token)}`);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setMessage(err.message || 'Network error — check server is running.');
      }
    };

    verify();
  }, [params?.token]);

  const handleResend = async () => {
    setResendMessage('');
    if (!resendEmail.trim()) {
      setResendMessage('Please enter your email address first.');
      return;
    }

    setResending(true);
    try {
      const result = await api.post('/auth/resend-verification', { email: resendEmail.trim() });
      setResendMessage(result?.message || 'Verification email resent.');
    } catch (err) {
      setResendMessage(err.message || 'Failed to resend verification email.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div>
      <Navbar role="customer" />

      <div style={{ maxWidth: '500px', margin: '60px auto', padding: '0 20px 60px', textAlign: 'center' }}>
        {status === 'verifying' && (
          <div style={{ color: 'var(--green-deep)', fontSize: '15px' }}>
            Verifying your email…
          </div>
        )}

        {status === 'success' && (
          <div style={{ background: '#e8f5e9', border: '1px solid var(--border)', borderRadius: '8px', padding: '36px 24px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>✓</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', fontWeight: 700, color: 'var(--green-deep)', marginBottom: '10px' }}>
              Email Verified!
            </div>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '24px' }}>
              Your account is now active. You can log in and start shopping.
            </p>
            <button className="btn btn-deep" onClick={() => navigate('login')}>
              Go to Login ›
            </button>
          </div>
        )}

        {status === 'error' && (
          <div style={{ background: '#fde8e6', border: '1px solid #f5c6c2', borderRadius: '8px', padding: '36px 24px' }}>
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>✗</div>
            <div style={{ fontFamily: "'Playfair Display',serif", fontSize: '20px', fontWeight: 700, color: 'var(--red)', marginBottom: '10px' }}>
              Verification Failed
            </div>
            <p style={{ fontSize: '13px', color: '#555', marginBottom: '24px' }}>{message}</p>
            <div style={{ textAlign: 'left', marginBottom: '16px' }}>
              <div style={{ fontSize: '12px', marginBottom: '6px', color: '#555' }}>Resend verification email</div>
              <input
                type="email"
                className="form-input"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                placeholder="you@example.com"
              />
              <button
                className="btn btn-deep"
                style={{ marginTop: '10px', width: '100%' }}
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? 'Resending…' : 'Resend Verification Email'}
              </button>
              {resendMessage && (
                <p style={{ fontSize: '12px', color: '#555', marginTop: '8px' }}>{resendMessage}</p>
              )}
            </div>
            <button className="btn btn-deep" onClick={() => navigate('register')}>
              Back to Register ›
            </button>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default VerifyEmailPage;
