import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState({});
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [passwords, setPasswords] = useState({ current: '', new: '' });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile', { credentials: 'include' });
      const data = await res.json();
      setProfile(data);
    } catch (err) {
      setError('Failed to load profile');
    }
  };

  const updateProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: profile.email,
          ...(user.role === 'producer' && { farm_name: profile.farm_name, contact_number: profile.contact_number })
        })
      });

      if (res.ok) {
        setMessage('Profile updated');
        setEditing(false);
        fetchProfile();
      } else {
        setError('Update failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const changePassword = async () => {
    if (!passwords.current || !passwords.new) {
      return setError('Both passwords required');
    }

    try {
      const res = await fetch('/api/profile/password', {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: passwords.current, newPassword: passwords.new })
      });

      if (res.ok) {
        setMessage('Password changed');
        setChangingPassword(false);
        setPasswords({ current: '', new: '' });
      } else {
        setError('Password change failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const deleteAccount = async () => {
    if (!window.confirm('Are you sure? This cannot be undone.')) return;

    try {
      const res = await fetch('/api/profile', { method: 'DELETE', credentials: 'include' });
      if (res.ok) {
        logout();
        navigate('/');
      } else {
        setError('Delete failed');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  return (
    <div className="page">
      <h1>Account Settings</h1>

      {message && <div className="alert alert-success">{message}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      <div className="card">
        <h2>Profile Information</h2>
        <div style={{ marginBottom: '1rem' }}>
          <p><strong>Email:</strong> {profile.email}</p>
          <p><strong>Role:</strong> {user?.role}</p>
          {user?.role === 'producer' && (
            <>
              <p><strong>Farm Name:</strong> {profile.farm_name}</p>
              <p><strong>Contact:</strong> {profile.contact_number}</p>
            </>
          )}
        </div>

        {!editing ? (
          <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
        ) : (
          <div>
            {user?.role === 'producer' && (
              <>
                <div className="form-group">
                  <label>Farm Name</label>
                  <input type="text" value={profile.farm_name || ''} onChange={(e) => setProfile({ ...profile, farm_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Contact</label>
                  <input type="text" value={profile.contact_number || ''} onChange={(e) => setProfile({ ...profile, contact_number: e.target.value })} />
                </div>
              </>
            )}
            <button className="btn btn-primary" onClick={updateProfile} style={{ marginRight: '0.5rem' }}>Save</button>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Security</h2>
        {!changingPassword ? (
          <button className="btn btn-primary" onClick={() => setChangingPassword(true)}>Change Password</button>
        ) : (
          <div>
            <div className="form-group">
              <label>Current Password</label>
              <input type="password" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
            </div>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" value={passwords.new} onChange={(e) => setPasswords({ ...passwords, new: e.target.value })} />
            </div>
            <button className="btn btn-primary" onClick={changePassword} style={{ marginRight: '0.5rem' }}>Update</button>
            <button className="btn btn-secondary" onClick={() => setChangingPassword(false)}>Cancel</button>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Danger Zone</h2>
        <button className="btn btn-danger" onClick={deleteAccount}>Delete Account</button>
      </div>
    </div>
  );
}
