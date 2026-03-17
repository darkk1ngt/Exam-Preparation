import { useState, useEffect } from 'react';

export default function PendingProducers() {
  const [producers, setProducers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProducers();
  }, []);

  const fetchProducers = async () => {
    try {
      const res = await fetch('/api/admin/producers', { credentials: 'include' });
      const data = await res.json();
      setProducers(data.producers);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const approveProducer = async (id) => {
    try {
      await fetch(`/api/admin/producers/${id}/approve`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchProducers();
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const rejectProducer = async (id) => {
    try {
      await fetch(`/api/admin/producers/${id}/reject`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      });
      fetchProducers();
    } catch (err) {
      alert('Failed to reject');
    }
  };

  if (loading) return <div className="page"><div className="loading-container"><div className="spinner"></div></div></div>;

  return (
    <div className="page">
      <h1>Pending Producer Approvals</h1>

      {producers.length === 0 ? (
        <div className="card">
          <p>✓ No pending producer applications.</p>
        </div>
      ) : (
        <div className="card">
          <table>
            <thead>
              <tr>
                <th>Farm Name</th>
                <th>Email</th>
                <th>Contact Number</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {producers.map(producer => (
                <tr key={producer.id}>
                  <td>{producer.farm_name}</td>
                  <td>{producer.email}</td>
                  <td>{producer.contact_number}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-success"
                      onClick={() => approveProducer(producer.id)}
                      style={{ marginRight: '0.25rem' }}
                    >
                      Approve
                    </button>
                    <button
                      className="btn btn-sm btn-danger"
                      onClick={() => rejectProducer(producer.id)}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
