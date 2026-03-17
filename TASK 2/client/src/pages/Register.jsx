import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('customer');
  const [farm_name, setFarmName] = useState('');
  const [contact_number, setContactNumber] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          role,
          ...(role === 'producer' && { farm_name, contact_number })
        })
      });

      const data = await res.json();

      if (!res.ok) {
        return setError(data.error || 'Registration failed');
      }

      setSuccess('Registration successful! Check your email to verify.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '500px', width: '100%' }}>
        <h1 style={{ textAlign: 'center' }}>Register</h1>
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>User Type</label>
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="customer">Customer</option>
              <option value="producer">Producer</option>
            </select>
          </div>
          {role === 'producer' && (
            <>
              <div className="form-group">
                <label>Farm Name</label>
                <input type="text" value={farm_name} onChange={(e) => setFarmName(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Contact Number</label>
                <input type="text" value={contact_number} onChange={(e) => setContactNumber(e.target.value)} required />
              </div>
            </>
          )}
          <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
            {loading ? 'Registering...' : 'Register'}
          </button>
        </form>
        <p style={{ textAlign: 'center', marginTop: '1rem' }}>
          Already have an account? <a href="/login">Login</a>
        </p>
      </div>
    </div>
  );
}
