import { useState, useEffect } from 'react';

export default function SlotManagement() {
  const [slots, setSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newSlot, setNewSlot] = useState({ slot_date: '', slot_time: '', max_capacity: '' });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    try {
      const res = await fetch('/api/admin/slots', { credentials: 'include' });
      const data = await res.json();
      setSlots(data.slots);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSlot = async (id) => {
    if (!window.confirm('Delete this slot?')) return;
    try {
      await fetch(`/api/admin/slots/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });
      fetchSlots();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const toggleAvailability = async (id, isAvailable) => {
    try {
      await fetch(`/api/admin/slots/${id}`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_available: !isAvailable })
      });
      fetchSlots();
    } catch (err) {
      alert('Failed to toggle');
    }
  };

  const addSlot = async () => {
    if (!newSlot.slot_date || !newSlot.slot_time || !newSlot.max_capacity) {
      alert('All fields required');
      return;
    }
    try {
      await fetch('/api/admin/slots', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSlot)
      });
      setNewSlot({ slot_date: '', slot_time: '', max_capacity: '' });
      setAdding(false);
      fetchSlots();
    } catch (err) {
      alert('Failed to add slot');
    }
  };

  if (loading) return <div className="page"><div className="loading-container"><div className="spinner"></div></div></div>;

  return (
    <div className="page">
      <h1>Collection Slots</h1>

      {!adding ? (
        <button className="btn btn-primary" onClick={() => setAdding(true)} style={{ marginBottom: '1rem' }}>+ Add Slot</button>
      ) : (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>Add New Collection Slot</h3>
          <div className="form-group">
            <label>Date</label>
            <input type="date" value={newSlot.slot_date} onChange={(e) => setNewSlot({ ...newSlot, slot_date: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Time</label>
            <input type="time" value={newSlot.slot_time} onChange={(e) => setNewSlot({ ...newSlot, slot_time: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Max Capacity</label>
            <input type="number" value={newSlot.max_capacity} onChange={(e) => setNewSlot({ ...newSlot, max_capacity: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={addSlot} style={{ marginRight: '0.5rem' }}>Save</button>
          <button className="btn btn-secondary" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Time</th>
              <th>Capacity</th>
              <th>Bookings</th>
              <th>Progress</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {slots.map(slot => {
              const percentage = (slot.current_bookings / slot.max_capacity) * 100;
              const isFull = slot.current_bookings >= slot.max_capacity;
              return (
                <tr key={slot.id}>
                  <td>{new Date(slot.slot_date).toLocaleDateString()}</td>
                  <td>{slot.slot_time}</td>
                  <td>{slot.max_capacity}</td>
                  <td>{slot.current_bookings}</td>
                  <td>
                    <div className="progress-bar" style={{ width: '120px', height: '20px' }}>
                      <div style={{ width: `${Math.min(percentage, 100)}%`, height: '100%', backgroundColor: isFull ? 'var(--color-danger)' : 'var(--color-success)' }}></div>
                    </div>
                  </td>
                  <td>
                    <button
                      className="pill"
                      onClick={() => toggleAvailability(slot.id, slot.is_available)}
                      style={{ backgroundColor: slot.is_available && !isFull ? 'var(--color-success)' : '#ccc', color: 'white' }}
                    >
                      {isFull ? 'Full' : 'Open'}
                    </button>
                  </td>
                  <td>
                    <button className="btn btn-sm btn-danger" onClick={() => deleteSlot(slot.id)}>Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
