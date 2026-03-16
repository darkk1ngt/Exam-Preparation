import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import config from '../config.js';
import { useFetch } from '../hooks/useFetch.js';

export default function Notifications() {
	const [tab, setTab] = useState('all');
	const unread_only = tab === 'unread';

	const { data, loading, error } = useFetch(
		`/api/notifications${unread_only ? '?unread_only=true' : ''}`,
	);

	const [notifications, setNotifications] = useState([]);

	useEffect(() => {
		setNotifications(data?.notifications ?? []);
	}, [data]);

	const unread_count = useMemo(
		() => notifications.filter((notification) => !notification.is_read).length,
		[notifications],
	);

	const markAsRead = async (notification_id) => {
		try {
			const response = await fetch(`${config.apiUrl}/api/notifications/${notification_id}/read`, {
				method: 'PATCH',
				credentials: 'include',
			});
			if (!response.ok) {
				return;
			}
			setNotifications((previous) =>
				previous.map((notification) =>
					notification.id === notification_id
						? { ...notification, is_read: true }
						: notification,
				),
			);
		} catch {
			return;
		}
	};

	const markAllAsRead = async () => {
		try {
			const response = await fetch(`${config.apiUrl}/api/notifications/read-all`, {
				method: 'PATCH',
				credentials: 'include',
			});
			if (!response.ok) {
				return;
			}
			setNotifications((previous) =>
				previous.map((notification) => ({ ...notification, is_read: true })),
			);
		} catch {
			return;
		}
	};

	if (loading) {
		return <p>Loading notifications...</p>;
	}

	return (
		<section className='card-grid'>
			<header className='card'>
				<h1>Notifications</h1>
				<div className='tabs'>
					<button type='button' className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>
						All
					</button>
					<button
						type='button'
						className={`tab ${tab === 'unread' ? 'active' : ''}`}
						onClick={() => setTab('unread')}
					>
						Unread ({unread_count})
					</button>
				</div>
				<button type='button' className='btn-outline' onClick={markAllAsRead}>
					Mark all as read
				</button>
			</header>

			{error && <p className='pill status-red'>{error}</p>}

			{notifications.length === 0 ? (
				<div className='card'>
					<p>{tab === 'all' ? 'You have no notifications yet' : "You're all caught up"}</p>
				</div>
			) : (
				notifications.map((notification) => (
					<article key={notification.id} className='card'>
						<p>{notification.message}</p>
						<small>{new Date(notification.created_at).toLocaleString()}</small>
						<div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
							{!notification.is_read && (
								<button
									type='button'
									className='btn-outline'
									onClick={() => markAsRead(notification.id)}
								>
									Mark read
								</button>
							)}
							{notification.order_id && (
								<Link className='btn' to={`/orders/${notification.order_id}`}>
									View Order
								</Link>
							)}
							{notification.product_id && (
								<Link className='btn-secondary' to={`/products`}>
									View Product
								</Link>
							)}
						</div>
					</article>
				))
			)}
		</section>
	);
}
