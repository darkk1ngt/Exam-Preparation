import { useState, useEffect } from 'react';

export default function Analytics() {
  const [analytics, setAnalytics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append('start', startDate);
      if (endDate) params.append('end', endDate);
      const res = await fetch(`/api/dashboard/analytics?${params}`, { credentials: 'include' });
      const data = await res.json();
      setAnalytics(data.analytics);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    setLoading(true);
    fetchAnalytics();
  };

  const totalSales = analytics.reduce((sum, cat) => sum + parseFloat(cat.total_sales || 0), 0);

  if (loading) return <div className="page"><div className="loading-container"><div className="spinner"></div></div></div>;

  return (
    <div className="page">
      <h1>Sales Analytics</h1>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <h3>Filter by Date Range</h3>
        <form onSubmit={handleFilter} style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div className="form-group" style={{ margin: 0 }}>
            <label>Start Date</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="form-group" style={{ margin: 0 }}>
            <label>End Date</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <button type="submit" className="btn btn-primary">Filter</button>
        </form>
      </div>

      <div className="card">
        <h3>Sales by Category</h3>
        {analytics.length === 0 ? (
          <p>No sales data available for the selected period.</p>
        ) : (
          <>
            <table>
              <thead>
                <tr>
                  <th>Category</th>
                  <th>Orders</th>
                  <th>Sales</th>
                  <th>Percentage</th>
                </tr>
              </thead>
              <tbody>
                {analytics.map((cat, idx) => {
                  const percentage = totalSales > 0 ? ((parseFloat(cat.total_sales) / totalSales) * 100).toFixed(1) : 0;
                  return (
                    <tr key={idx}>
                      <td><strong>{cat.category}</strong></td>
                      <td>{cat.order_count}</td>
                      <td>£{parseFloat(cat.total_sales).toFixed(2)}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          <div className="progress-bar" style={{ width: '100px', height: '20px' }}>
                            <div style={{ width: `${percentage}%`, height: '100%', backgroundColor: 'var(--color-success)' }}></div>
                          </div>
                          {percentage}%
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #ddd' }}>
              <strong>Total Sales: £{totalSales.toFixed(2)}</strong>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
