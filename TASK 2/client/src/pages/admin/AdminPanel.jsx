import { Link } from 'react-router-dom';

export default function AdminPanel() {
  return (
    <div className="page">
      <h1>Admin Panel</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
        <div className="card">
          <h2>👥 Pending Producer Approvals</h2>
          <p>Review and approve or reject new producer registrations.</p>
          <Link to="/admin/producers" className="btn btn-primary">Manage Approvals</Link>
        </div>

        <div className="card">
          <h2>📅 Collection Slots</h2>
          <p>Create, edit, and manage collection slot availability.</p>
          <Link to="/admin/slots" className="btn btn-primary">Manage Slots</Link>
        </div>
      </div>
    </div>
  );
}
