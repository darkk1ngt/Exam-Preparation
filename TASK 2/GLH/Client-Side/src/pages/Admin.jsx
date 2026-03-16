import { useEffect, useMemo, useState } from 'react';
import config from '../config.js';

export default function Admin() {
	const [users, setUsers] = useState([]);
	const [slots, setSlots] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [new_slot_date, setNewSlotDate] = useState(new Date().toISOString().slice(0, 10));
	const [new_slot_time, setNewSlotTime] = useState('09:00');
	const [new_max_capacity, setNewMaxCapacity] = useState(10);

	async function fetchAdminData() {
		setLoading(true);
		setError('');
		try {
			const [users_response, slots_response] = await Promise.all([
				fetch(`${config.apiUrl}/api/admin/users?role=producer`, {
					credentials: 'include',
				}),
				fetch(`${config.apiUrl}/api/slots`, { credentials: 'include' }),
			]);

			if (!users_response.ok || !slots_response.ok) {
				throw new Error('Unable to load admin panel data.');
			}

			const users_data = await users_response.json();
			const slots_data = await slots_response.json();

			setUsers(users_data.users ?? []);
			setSlots(slots_data.slots ?? []);
		} catch (fetch_error) {
			setError(fetch_error.message);
		} finally {
			setLoading(false);
		}
	}

	useEffect(() => {
		fetchAdminData();
	}, []);

	const pending_producers = useMemo(
		() => users.filter((user) => user.producer_status === 'pending'),
		[users],
	);

	const updateProducerStatus = async (id, producer_status) => {
		setError('');
		try {
			const response = await fetch(`${config.apiUrl}/api/admin/users/${id}/producer-status`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ producer_status }),
			});
			if (!response.ok) {
				throw new Error('Unable to update producer status.');
			}
			await fetchAdminData();
		} catch (request_error) {
			setError(request_error.message);
		}
	};

	const toggleSlotAvailability = async (slot) => {
		setError('');
		try {
			const response = await fetch(`${config.apiUrl}/api/slots/${slot.id}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({ is_available: !Boolean(slot.is_available) }),
			});
			if (!response.ok) {
				throw new Error('Unable to update slot.');
			}
			await fetchAdminData();
		} catch (request_error) {
			setError(request_error.message);
		}
	};

	const handleAddSlot = async () => {
		setError('');
		try {
			const response = await fetch(`${config.apiUrl}/api/slots`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					slot_date: new_slot_date,
					slot_time: new_slot_time,
					max_capacity: Number(new_max_capacity),
				}),
			});
			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.error || 'Unable to create slot.');
			}
			await fetchAdminData();
		} catch (request_error) {
			setError(request_error.message);
		}
	};

	if (loading) {
		return <p>Loading admin panel...</p>;
	}

	return (
		<section className='card-grid'>
			<header className='card admin-banner'>
				<h1>Admin Panel</h1>
				<p>Manage producers, users, and collection slots.</p>
			</header>

			{error && <p className='pill status-red'>{error}</p>}

			<div className='split-layout'>
				<div className='card'>
					<h2>
						Pending Producer Approvals <span className='pill pill-amber'>{pending_producers.length}</span>
					</h2>
					<div className='card-grid'>
						{pending_producers.map((producer) => {
							const initials = (producer.farm_name || producer.email || 'P').slice(0, 2).toUpperCase();
							return (
								<div key={producer.id} className='card'>
									<div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
										<span className='avatar-chip'>{initials}</span>
										<div>
											<strong>{producer.farm_name || 'Unnamed farm'}</strong>
											<p>{producer.email}</p>
											<p>{producer.contact_number || 'No contact number'}</p>
										</div>
									</div>
									<div style={{ display: 'flex', gap: '0.5rem' }}>
										<button
											type='button'
											className='btn'
											onClick={() => updateProducerStatus(producer.id, 'approved')}
										>
											Approve
										</button>
										<button
											type='button'
											className='btn-outline'
											onClick={() => updateProducerStatus(producer.id, 'rejected')}
										>
											Reject
										</button>
									</div>
								</div>
							);
						})}
					</div>
				</div>

				<div className='card'>
					<h2>Collection Slot Management</h2>
					<div className='table-wrap'>
						<table>
							<thead>
								<tr>
									<th>Time</th>
									<th>Capacity</th>
									<th>Status</th>
									<th>Action</th>
								</tr>
							</thead>
							<tbody>
								{slots.map((slot) => {
									const fill_percentage = Math.min(
										100,
										Math.round((slot.current_bookings / slot.max_capacity) * 100),
									);
									const is_full = slot.current_bookings >= slot.max_capacity;
									return (
										<tr key={slot.id}>
											<td>{String(slot.slot_time).slice(0, 5)}</td>
											<td>
												<div className='progress-track'>
													<div className='progress-fill' style={{ width: `${fill_percentage}%` }} />
												</div>
												<small>
													{slot.current_bookings}/{slot.max_capacity}
												</small>
											</td>
											<td>
												<span className={`pill ${is_full ? 'pill-red' : 'pill-green'}`}>
													{is_full || !slot.is_available ? 'Full' : 'Open'}
												</span>
											</td>
											<td>
												<button type='button' className='btn-outline' onClick={() => toggleSlotAvailability(slot)}>
													Edit
												</button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>

					<div className='card' style={{ borderStyle: 'dashed', marginTop: '1rem' }}>
						<h3>Add new slot</h3>
						<div className='card-grid'>
							<input className='input' type='date' value={new_slot_date} onChange={(event) => setNewSlotDate(event.target.value)} />
							<input className='input' type='time' value={new_slot_time} onChange={(event) => setNewSlotTime(event.target.value)} />
							<input
								className='input'
								type='number'
								value={new_max_capacity}
								onChange={(event) => setNewMaxCapacity(event.target.value)}
								min='1'
							/>
							<button type='button' className='btn-outline' onClick={handleAddSlot}>
								Add new slot
							</button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
