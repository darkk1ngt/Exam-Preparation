import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar.jsx';
import Footer from '../components/Footer.jsx';
import { useNavigation } from '../context/NavigationContext.jsx';

const VerifyEmailPage = () => {
  const { params, navigate } = useNavigation();
  const [status, setStatus] = useState('verifying'); // 'verifying' | 'success' | 'error'
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      const token = params?.token;
      if (!token) {
        setStatus('error');
        setMessage('No verification token found.');
        return;
      }

      try {
        const res = await fetch(`/api/auth/verify-email?token=${token}`, {
          credentials: 'include',
        });
        const data = await res.json();
        if (res.ok) {
          setStatus('success');
        } else {
          setStatus('error');
          setMessage(data.error || 'Verification failed.');
        }
      } catch {
        setStatus('error');
        setMessage('Network error — check server is running.');
      }
    };

    verify();
  }, []);

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
