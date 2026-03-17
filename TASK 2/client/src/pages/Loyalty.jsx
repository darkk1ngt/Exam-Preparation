import { useState, useEffect } from 'react';

export default function Loyalty() {
  const [loyalty, setLoyalty] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLoyalty();
  }, []);

  const fetchLoyalty = async () => {
    try {
      const res = await fetch('/api/loyalty', { credentials: 'include' });
      const data = await res.json();
      setLoyalty(data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page"><div className="loading-container"><div className="spinner"></div></div></div>;
  if (!loyalty) return <div className="page"><p>Loyalty data not found</p></div>;

  const progress = Math.min(100, (loyalty.points_balance / loyalty.discount_threshold) * 100);

  return (
    <div className="page">
      <h1>Loyalty Points</h1>

      <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ fontSize: '3rem', margin: '1rem 0' }}>{loyalty.points_balance}</h2>
        <p style={{ fontSize: '1.2rem', color: '#666' }}>Points Balance</p>
      </div>

      <div className="card">
        <h3>Progress to Discount</h3>
        <p>You need {Math.max(0, loyalty.discount_threshold - loyalty.points_balance)} more points to unlock a discount!</p>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${progress}%` }}>
            {Math.round(progress)}%
          </div>
        </div>
        <p style={{ textAlign: 'center', color: '#666', marginTop: '1rem' }}>
          {loyalty.points_balance} / {loyalty.discount_threshold} points
        </p>
      </div>

      <div className="card" style={{ backgroundColor: loyalty.discount_active ? '#D4EDDA' : '#F8D7DA', borderLeft: `4px solid ${loyalty.discount_active ? '#28A745' : '#DC3545'}` }}>
        <h3 style={{ color: loyalty.discount_active ? '#155724' : '#721C24' }}>
          {loyalty.discount_active ? '✓ Discount Active' : '✗ No Active Discount'}
        </h3>
        {loyalty.discount_active && (
          <p style={{ color: loyalty.discount_active ? '#155724' : '#721C24' }}>
            You have a <strong>£{loyalty.discount_value}</strong> discount waiting! Use it at checkout.
          </p>
        )}
        {!loyalty.discount_active && (
          <p style={{ color: '#721C24' }}>
            Reach {loyalty.discount_threshold} points to unlock £{loyalty.discount_value} discount.
          </p>
        )}
      </div>

      <div className="card">
        <h3>How it works</h3>
        <ul style={{ paddingLeft: '1.5rem' }}>
          <li>Earn {loyalty.points_rate} point per £1 spent</li>
          <li>Reach {loyalty.discount_threshold} points to unlock £{loyalty.discount_value} discount</li>
          <li>Use your discount at checkout</li>
          <li>Points reset after redemption</li>
        </ul>
      </div>
    </div>
  );
}
