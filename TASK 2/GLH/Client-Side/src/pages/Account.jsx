import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import config from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function Account() {
	const navigate = useNavigate();
	const { checkAuth } = useAuth();
	const [account, setAccount] = useState(null);
	const [last_orders, setLastOrders] = useState([]);
	const [loyalty_summary, setLoyaltySummary] = useState(null);
	const [current_password_email, setCurrentPasswordEmail] = useState('');
	const [new_email, setNewEmail] = useState('');
	const [current_password_password, setCurrentPasswordPassword] = useState('');
	const [new_password, setNewPassword] = useState('');
	const [delete_password, setDeletePassword] = useState('');
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const [loading, setLoading] = useState(true);

	async function loadAccount() {
		setLoading(true);
		setError('');
		try {
			const response = await fetch(`${config.apiUrl}/api/account`, {
				credentials: 'include',
			});
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Unable to load account page.');
			}
			const data = await response.json();
			setAccount(data.account ?? null);
			setLastOrders(data.last_orders ?? []);
			setLoyaltySummary(data.loyalty_summary ?? null);
		} catch (fetch_error) {
			setError(fetch_error.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		loadAccount();
	}, []);

	const submitEmail = async (event) => {
		event.preventDefault();
		setMessage('');
		setError('');
		try {
			const response = await fetch(`${config.apiUrl}/api/account/email`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ current_password: current_password_email, new_email }),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || 'Unable to update email.');
			}
			setMessage(data.message);
			setCurrentPasswordEmail('');
			setNewEmail('');
			await checkAuth();
			await loadAccount();
		} catch (request_error) {
			setError(request_error.message);
		}
	};

	const submitPassword = async (event) => {
		event.preventDefault();
		setMessage('');
		setError('');
		try {
			const response = await fetch(`${config.apiUrl}/api/account/password`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					current_password: current_password_password,
					new_password,
				}),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || 'Unable to update password.');
			}
			setMessage(data.message);
			setCurrentPasswordPassword('');
			setNewPassword('');
		} catch (request_error) {
			setError(request_error.message);
		}
	};

	const deleteAccount = async () => {
		setMessage('');
		setError('');
		try {
			const response = await fetch(`${config.apiUrl}/api/account`, {
				method: 'DELETE',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ current_password: delete_password }),
			});
			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || 'Unable to delete account.');
			}
			navigate('/register');
		} catch (request_error) {
			setError(request_error.message);
		}
	};

	if (loading) {
		return <p>Loading account...</p>;
	}

	return (
		<section className='card-grid'>
			<div className='card'>
				<h1>Account</h1>
				<p>Email: {account?.email}</p>
				<p>Created: {account?.created_at ? new Date(account.created_at).toLocaleString() : '-'}</p>
			</div>

			{message && <p className='pill pill-green'>{message}</p>}
			{error && <p className='pill status-red'>{error}</p>}

			<div className='split-layout'>
				<form className='card card-grid' onSubmit={submitEmail}>
					<h2>Change email</h2>
					<input
						className='input'
						type='password'
						placeholder='Current password'
						value={current_password_email}
						onChange={(event) => setCurrentPasswordEmail(event.target.value)}
					/>
					<input
						className='input'
						type='email'
						placeholder='New email'
						value={new_email}
						onChange={(event) => setNewEmail(event.target.value)}
					/>
					<button className='btn' type='submit'>
						Update email
					</button>
				</form>

				<form className='card card-grid' onSubmit={submitPassword}>
					<h2>Change password</h2>
					<input
						className='input'
						type='password'
						placeholder='Current password'
						value={current_password_password}
						onChange={(event) => setCurrentPasswordPassword(event.target.value)}
					/>
					<input
						className='input'
						type='password'
						placeholder='New password'
						value={new_password}
						onChange={(event) => setNewPassword(event.target.value)}
					/>
					<button className='btn' type='submit'>
						Update password
					</button>
				</form>
			</div>

			<div className='split-layout'>
				<div className='card'>
					<h2>Last 3 orders</h2>
					{last_orders.length === 0 ? (
						<p>No orders yet.</p>
					) : (
						<div className='card-grid'>
							{last_orders.map((order) => (
								<Link key={order.id} className='btn-outline' to={`/orders/${order.id}`}>
									Order #{order.id} ({order.status})
								</Link>
							))}
						</div>
					)}
					<Link className='btn' to='/orders'>
						Go to /orders
					</Link>
				</div>

				<div className='card'>
					<h2>Loyalty summary</h2>
					<p>points_balance: {loyalty_summary?.points_balance ?? 0}</p>
					<p>discount_active: {String(Boolean(loyalty_summary?.discount_active))}</p>
					<Link className='btn' to='/loyalty'>
						Go to /loyalty
					</Link>
				</div>
			</div>

			<div className='card card-grid'>
				<h2>Delete account</h2>
				<input
					className='input'
					type='password'
					placeholder='Confirm with password'
					value={delete_password}
					onChange={(event) => setDeletePassword(event.target.value)}
				/>
				<button type='button' className='btn-danger' onClick={deleteAccount}>
					Delete account
				</button>
			</div>
		</section>
	);
}
