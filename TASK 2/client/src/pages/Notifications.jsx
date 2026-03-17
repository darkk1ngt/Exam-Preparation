import { useState, useEffect } from 'react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications', { credentials: 'include' });
      const data = await res.json();
      setNotifications(data.notifications);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: 'PUT', credentials: 'include' });
      fetchNotifications();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/notifications/read-all', { method: 'PUT', credentials: 'include' });
      fetchNotifications();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  if (loading) return <div className="page"><div className="loading-container"><div className="spinner"></div></div></div>;

  const unread = notifications.filter(n => !n.is_read);

  return (
    <div className="page">
      <h1>Notifications</h1>

      {unread.length > 0 && (
        <div style={{ marginBottom: '1rem' }}>
          <button className="btn btn-secondary" onClick={markAllAsRead}>
            Mark all as read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="card" style={{ textAlign: 'center' }}>
          <p>No notifications</p>
        </div>
      ) : (
        <div className="card">
          {notifications.map(notification => (
            <div
              key={notification.id}
              style={{
                padding: '1rem',
                borderBottom: '1px solid #eee',
                backgroundColor: notification.is_read ? '#fff' : '#f9f9f9',
                borderLeft: notification.is_read ? 'none' : '4px solid var(--color-green)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <span style={{ fontWeight: 'bold' }}>
                      {notification.type === 'order_update' ? '📦' : '🌾'} {notification.type === 'order_update' ? 'Order Update' : 'Product Available'}
                    </span>
                    {!notification.is_read && <span className="badge badge-info">New</span>}
                  </div>
                  <p style={{ margin: '0.5rem 0 0 0', color: '#666' }}>{notification.message}</p>
                  <p style={{ margin: '0.5rem 0 0 0', fontSize: '12px', color: '#999' }}>
                    {new Date(notification.created_at).toLocaleDateString()} {new Date(notification.created_at).toLocaleTimeString()}
                  </p>
                </div>
                {!notification.is_read && (
                  <button className="btn btn-sm btn-primary" onClick={() => markAsRead(notification.id)}>
                    Mark read
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
