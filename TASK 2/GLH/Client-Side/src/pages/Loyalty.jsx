import { useMemo } from 'react';
import { useFetch } from '../hooks/useFetch.js';

export default function Loyalty() {
	const { data, loading, error } = useFetch('/api/loyalty');
	const loyalty = data?.loyalty ?? null;
	const history = data?.history ?? [];

	const progress = useMemo(() => {
		if (!loyalty) {
			return 0;
		}
		const percent = Math.min(
			100,
			Math.floor((Number(loyalty.points_balance) / Number(loyalty.discount_threshold)) * 100),
		);
		return Number.isFinite(percent) ? percent : 0;
	}, [loyalty]);

	const points_remaining = Math.max(
		0,
		Number(loyalty?.discount_threshold || 100) - Number(loyalty?.points_balance || 0),
	);

	if (loading) {
		return <p>Loading loyalty...</p>;
	}

	return (
		<section className='card-grid'>
			<header className='card'>
				<h1>Loyalty</h1>
				{error && <p className='pill status-red'>{error}</p>}
			</header>

			{loyalty && (
				<div className='card'>
					<p>Current points balance: {loyalty.points_balance}</p>
					<p>Points earning rate: {Number(loyalty.points_rate).toFixed(2)}x</p>
					<p>Progress: {progress}%</p>
					<div className='progress-track'>
						<div className='progress-fill' style={{ width: `${progress}%` }} />
					</div>
					<p>{points_remaining} points remaining until your next discount unlocks.</p>
				</div>
			)}

			{Boolean(loyalty?.discount_active) && (
				<div className='card pill-green'>
					<strong>Discount active</strong>
					<p>£{Number(loyalty.discount_value).toFixed(2)} applies automatically at checkout.</p>
				</div>
			)}

			<div className='card'>
				<h2>Points history</h2>
				{history.length === 0 ? (
					<p>No completed orders yet.</p>
				) : (
					<div className='table-wrap'>
						<table>
							<thead>
								<tr>
									<th>Order</th>
									<th>Status</th>
									<th>Total</th>
									<th>Points earned</th>
									<th>Discount</th>
								</tr>
							</thead>
							<tbody>
								{history.map((entry) => (
									<tr key={entry.order_id}>
										<td>#{entry.order_id}</td>
										<td>{entry.status}</td>
										<td>£{Number(entry.total_price).toFixed(2)}</td>
										<td>{entry.points_earned}</td>
										<td>
											{Number(entry.discount_applied) > 0 ? (
												<span className='pill pill-amber'>Discount used</span>
											) : (
												<span>-</span>
											)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</section>
	);
}
