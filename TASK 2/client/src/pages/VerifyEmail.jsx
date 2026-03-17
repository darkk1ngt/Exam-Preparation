import { useSearchParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { user } = useAuth();

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Invalid verification link');
      setLoading(false);
      return;
    }

    fetch(`/api/auth/verify-email?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else {
          setMessage('Email verified successfully!');
          // If already logged in, go to home. Otherwise, go to login.
          setTimeout(() => {
            navigate(user ? '/' : '/login');
          }, 2000);
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Verification failed');
        setLoading(false);
      });
  }, [token, navigate, user]);

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '400px', width: '100%', textAlign: 'center' }}>
        <h1>Email Verification</h1>
        {loading && <div className="loading-container"><div className="spinner"></div></div>}
        {error && <div className="alert alert-error">{error}</div>}
        {message && <div className="alert alert-success">{message}</div>}
      </div>
    </div>
  );
}
