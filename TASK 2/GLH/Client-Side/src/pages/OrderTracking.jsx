import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import config from '../config.js';

const collection_steps = [
	{ key: 'pending', label: 'Pending' },
	{ key: 'confirmed', label: 'Confirmed' },
	{ key: 'ready', label: 'Ready' },
	{ key: 'collected', label: 'Collected' },
];

const delivery_steps = [
	{ key: 'pending', label: 'Pending' },
	{ key: 'confirmed', label: 'Confirmed' },
	{ key: 'ready', label: 'Ready' },
	{ key: 'out_for_delivery', label: 'Out for Delivery' },
	{ key: 'delivered', label: 'Delivered' },
];

export default function OrderTracking() {
	const { id } = useParams();
	const [order, setOrder] = useState(null);
	const [items, setItems] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [order_notifications, setOrderNotifications] = useState([]);
	const [cancel_loading, setCancelLoading] = useState(false);

	useEffect(() => {
		let interval_id;
		let is_active = true;

		async function fetchOrder() {
			try {
				const response = await fetch(`${config.apiUrl}/api/orders/${id}`, {
					credentials: 'include',
				});
				if (!response.ok) {
					const data = await response.json();
					throw new Error(data.error || 'Unable to load order tracking.');
				}
				const data = await response.json();
				if (!is_active) {
					return;
				}
				setOrder(data.order ?? null);
				setItems(data.items ?? []);
				setOrderNotifications(data.order_notifications ?? []);
				setError('');
			} catch (fetch_error) {
				if (is_active) {
					setError(fetch_error.message);
				}
			} finally {
				if (is_active) {
					setLoading(false);
				}
			}
		}

		fetchOrder();
		interval_id = setInterval(fetchOrder, 30000);

		return () => {
			is_active = false;
			clearInterval(interval_id);
		};
	}, [id]);

	const timeline_steps =
		order?.fulfilment_type === 'delivery' ? delivery_steps : collection_steps;

	const current_index = useMemo(() => {
		if (!order) {
			return -1;
		}
		if (order.status === 'cancelled') {
			return -1;
		}
		return timeline_steps.findIndex((step) => step.key === order.status);
	}, [order, timeline_steps]);

	const pre_discount_subtotal = useMemo(() => {
		return items.reduce(
			(sum, item) => sum + Number(item.quantity) * Number(item.unit_price),
			0,
		);
	}, [items]);

	const cancelOrder = async () => {
		setCancelLoading(true);
		setError('');
		try {
			const response = await fetch(`${config.apiUrl}/api/orders/${id}`, {
				method: 'DELETE',
				credentials: 'include',
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || 'Unable to cancel order.');
			}
			setOrder((previous) => ({ ...previous, status: 'cancelled' }));
			setOrderNotifications((previous) => [
				{
					id: `new-${Date.now()}`,
					message: `Your order #${id} has been cancelled.`,
					created_at: new Date().toISOString(),
					is_read: false,
				},
				...previous,
			]);
		} catch (request_error) {
			setError(request_error.message);
		} finally {
			setCancelLoading(false);
		}
	};

	if (loading) {
		return <p>Loading order...</p>;
	}

	if (error) {
		return <p className='pill status-red'>{error}</p>;
	}

	if (!order) {
		return <p className='pill status-red'>Order not found.</p>;
	}

	return (
		<section className='card-grid'>
			<header className='card'>
				<h1>Order #{order.id}</h1>
				<p>Placed: {new Date(order.created_at).toLocaleString()}</p>
				<p>Fulfilment: {order.fulfilment_type === 'collection' ? 'Collection' : 'Delivery'}</p>
				<p>
					Status:{' '}
					<span className={`pill ${order.status === 'cancelled' ? 'pill-red' : 'pill-green'}`}>
						{String(order.status).replaceAll('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase())}
					</span>
				</p>
				{order.status === 'pending' && (
					<button type='button' className='btn-danger' disabled={cancel_loading} onClick={cancelOrder}>
						{cancel_loading ? 'Cancelling...' : 'Cancel order'}
					</button>
				)}
			</header>

			<div className='card'>
				{order.status === 'cancelled' ? (
					<div className='timeline'>
						<div className='timeline-item'>
							<div className='timeline-dot current' />
							<strong>Cancelled</strong>
							<p>{new Date(order.updated_at).toLocaleString()}</p>
						</div>
					</div>
				) : (
					<div className='timeline'>
						{timeline_steps.map((step, index) => {
							const is_complete = current_index > index;
							const is_current = current_index === index;
							return (
								<div className='timeline-item' key={step.key}>
									<div
										className={`timeline-dot ${is_complete ? 'complete' : ''} ${
											is_current ? 'current' : ''
										}`}
									/>
									<strong>{step.label}</strong>
									<p>{new Date(order.updated_at).toLocaleString()}</p>
								</div>
							);
						})}
					</div>
				)}
			</div>

			<div className='card'>
				<h2>Order summary</h2>
				<p>Subtotal: £{pre_discount_subtotal.toFixed(2)}</p>
				<p>Discount: -£{Number(order.discount_applied || 0).toFixed(2)}</p>
				<p>
					<strong>Total: £{Number(order.total_price).toFixed(2)}</strong>
				</p>
				{order.fulfilment_type === 'collection' ? (
					<p>
						Collection slot:{' '}
						{order.collection_slot_id && order.slot_date && order.slot_time
							? `${order.slot_date} ${String(order.slot_time).slice(0, 5)}`
							: 'Slot no longer available'}
					</p>
				) : (
					<div>
						<p>Delivery address line 1: {order.delivery_address_line1 || '-'}</p>
						<p>Delivery address line 2: {order.delivery_address_line2 || '-'}</p>
						<p>Delivery city: {order.delivery_city || '-'}</p>
						<p>Delivery postcode: {order.delivery_postcode || '-'}</p>
					</div>
				)}
			</div>

			<div className='card'>
				<h2>Order items</h2>
				<div className='card-grid'>
					{items.map((item) => (
						<div key={item.id} className='card'>
							<strong>{item.product_name_snapshot}</strong>
							<p>Quantity: {item.quantity}</p>
							<p>Unit price: £{Number(item.unit_price).toFixed(2)}</p>
						</div>
					))}
				</div>
			</div>

			<div className='card'>
				<h2>Order update timeline</h2>
				{order_notifications.length === 0 ? (
					<p>No order update notifications yet.</p>
				) : (
					<div className='card-grid'>
						{order_notifications.map((notification) => (
							<div className='card' key={notification.id}>
								<p>{notification.message}</p>
								<small>{new Date(notification.created_at).toLocaleString()}</small>
							</div>
						))}
					</div>
				)}
			</div>
		</section>
	);
}
