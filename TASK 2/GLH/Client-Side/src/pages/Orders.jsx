import { Link } from 'react-router-dom';
import { useFetch } from '../hooks/useFetch.js';

function getStatusClass(status) {
	if (status === 'cancelled') {
		return 'pill-red';
	}
	if (['delivered', 'collected'].includes(status)) {
		return 'pill-green';
	}
	if (status === 'out_for_delivery') {
		return 'pill-amber';
	}
	return 'pill-green';
}

function formatStatus(status) {
	return String(status).replaceAll('_', ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatFulfilment(type) {
	return String(type).replace(/\b\w/g, (char) => char.toUpperCase());
}

export default function Orders() {
	const { data, loading, error } = useFetch('/api/orders');
	const orders = data?.orders ?? [];

	if (loading) {
		return <p>Loading orders...</p>;
	}

	return (
		<section className='card-grid'>
			<header className='card'>
				<h1>Order History</h1>
				<p>Status indicators use both colour and text labels.</p>
			</header>

			{error && <p className='pill status-red'>{error}</p>}

			{orders.length === 0 ? (
				<div className='card'>
					<p>You have no orders yet.</p>
				</div>
			) : (
				<div className='card table-wrap'>
					<table>
						<thead>
							<tr>
								<th>Order</th>
								<th>Created</th>
								<th>Fulfilment</th>
								<th>Status</th>
								<th>Total</th>
								<th>Action</th>
							</tr>
						</thead>
						<tbody>
							{orders.map((order) => (
								<tr key={order.id}>
									<td>#{order.id}</td>
									<td>{new Date(order.created_at).toLocaleString()}</td>
									<td>{formatFulfilment(order.fulfilment_type)}</td>
									<td>
										<span className={`pill ${getStatusClass(order.status)}`}>
											{formatStatus(order.status)}
										</span>
									</td>
									<td>£{Number(order.total_price).toFixed(2)}</td>
									<td>
										<Link to={`/orders/${order.id}`} className='btn-outline'>
											Open
										</Link>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</section>
	);
}
