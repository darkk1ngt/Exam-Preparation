import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config.js';

const time_slot_order = ['09:00', '10:30', '12:00', '13:30', '15:00', '16:30'];

export default function Checkout() {
	const navigate = useNavigate();
	const [cart_items, setCartItems] = useState([]);
	const [loyalty, setLoyalty] = useState(null);
	const [slot_date, setSlotDate] = useState(new Date().toISOString().slice(0, 10));
	const [slots, setSlots] = useState([]);
	const [selected_slot_id, setSelectedSlotId] = useState(null);
	const [fulfilment_type, setFulfilmentType] = useState('collection');
	const [delivery_address_line1, setDeliveryAddressLine1] = useState('');
	const [delivery_address_line2, setDeliveryAddressLine2] = useState('');
	const [delivery_city, setDeliveryCity] = useState('');
	const [delivery_postcode, setDeliveryPostcode] = useState('');
	const [loading, setLoading] = useState(true);
	const [placing_order, setPlacingOrder] = useState(false);
	const [error, setError] = useState('');

	useEffect(() => {
		let is_active = true;
		async function fetchCheckoutData() {
			setLoading(true);
			try {
				const [cart_response, loyalty_response] = await Promise.all([
					fetch(`${config.apiUrl}/api/cart`, { credentials: 'include' }),
					fetch(`${config.apiUrl}/api/loyalty`, { credentials: 'include' }),
				]);

				if (!cart_response.ok || !loyalty_response.ok) {
					throw new Error('Unable to load checkout data.');
				}

				const cart_data = await cart_response.json();
				const loyalty_data = await loyalty_response.json();

				if (!is_active) {
					return;
				}

				setCartItems(cart_data.items ?? []);
				setLoyalty(loyalty_data.loyalty ?? null);
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

		fetchCheckoutData();

		return () => {
			is_active = false;
		};
	}, []);

	useEffect(() => {
		let is_active = true;
		async function fetchSlots() {
			try {
				const response = await fetch(`${config.apiUrl}/api/slots?date=${slot_date}`, {
					credentials: 'include',
				});
				if (!response.ok) {
					throw new Error('Unable to load collection slots.');
				}
				const data = await response.json();
				if (is_active) {
					setSlots(data.slots ?? []);
				}
			} catch {
				if (is_active) {
					setSlots([]);
				}
			}
		}

		if (fulfilment_type === 'collection') {
			fetchSlots();
		}

		return () => {
			is_active = false;
		};
	}, [slot_date, fulfilment_type]);

	const subtotal = useMemo(
		() =>
			cart_items.reduce(
				(sum, item) => sum + Number(item.price) * Number(item.quantity),
				0,
			),
		[cart_items],
	);
	const discount = loyalty?.discount_active ? Number(loyalty.discount_value || 0) : 0;
	const final_total = Math.max(0, subtotal - discount);

	const slot_lookup = useMemo(() => {
		const map = new Map();
		for (const slot of slots) {
			map.set(String(slot.slot_time).slice(0, 5), slot);
		}
		return map;
	}, [slots]);

	const handlePlaceOrder = async () => {
		setPlacingOrder(true);
		setError('');
		try {
			const response = await fetch(`${config.apiUrl}/api/orders`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				credentials: 'include',
				body: JSON.stringify({
					fulfilment_type,
					collection_slot_id: fulfilment_type === 'collection' ? selected_slot_id : null,
					delivery_address_line1:
						fulfilment_type === 'delivery' ? delivery_address_line1 : null,
					delivery_address_line2:
						fulfilment_type === 'delivery' ? delivery_address_line2 : null,
					delivery_city: fulfilment_type === 'delivery' ? delivery_city : null,
					delivery_postcode:
						fulfilment_type === 'delivery' ? delivery_postcode : null,
				}),
			});

			const data = await response.json();
			if (!response.ok) {
				throw new Error(data.error || 'Failed to place order.');
			}

			if (data.orderId) {
				localStorage.setItem('last_order_id', String(data.orderId));
				navigate(`/orders/${data.orderId}`);
			}
		} catch (place_error) {
			setError(place_error.message);
		} finally {
			setPlacingOrder(false);
		}
	};

	if (loading) {
		return <p>Loading checkout...</p>;
	}

	return (
		<section className='split-layout'>
			<div className='card'>
				<h1>Checkout</h1>
				<h2>Order summary</h2>
				<div className='card-grid'>
					{cart_items.map((item) => (
						<div key={item.product_id} className='card'>
							<strong>{item.name}</strong>
							<p>Quantity: {item.quantity}</p>
							<p>Price: £{Number(item.price).toFixed(2)}</p>
						</div>
					))}
				</div>

				{loyalty?.discount_active && (
					<div className='card pill-green mt-1'>
						<strong>Loyalty discount applied: -£{Number(loyalty.discount_value).toFixed(2)}</strong>
						<p>Your {loyalty.points_balance} points have unlocked a discount at checkout.</p>
					</div>
				)}

				<div className='card mt-1'>
					<p>Subtotal: £{subtotal.toFixed(2)}</p>
					<p>Discount: -£{discount.toFixed(2)}</p>
					<p>
						<strong>Final total: £{final_total.toFixed(2)}</strong>
					</p>
				</div>
			</div>

			<div className='card'>
				<h2>Fulfilment</h2>
				<div className='tabs' style={{ marginBottom: '0.75rem' }}>
					<button
						type='button'
						className={fulfilment_type === 'collection' ? 'btn' : 'btn-outline'}
						onClick={() => setFulfilmentType('collection')}
					>
						Collection
					</button>
					<button
						type='button'
						className={fulfilment_type === 'delivery' ? 'btn' : 'btn-outline'}
						onClick={() => setFulfilmentType('delivery')}
					>
						Delivery
					</button>
				</div>

				{fulfilment_type === 'collection' ? (
					<>
						<label htmlFor='slot_date'>Collection date</label>
						<input
							id='slot_date'
							type='date'
							className='input'
							value={slot_date}
							onChange={(event) => setSlotDate(event.target.value)}
						/>
						<div
							style={{
								display: 'grid',
								gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
								gap: '0.5rem',
								marginTop: '0.75rem',
							}}
						>
							{time_slot_order.map((time_value) => {
								const slot = slot_lookup.get(time_value);
								const is_full =
									!slot ||
									!slot.is_available ||
									slot.current_bookings >= slot.max_capacity;
								const is_selected = selected_slot_id === slot?.id;

								return (
									<button
										key={time_value}
										type='button'
										className={is_selected ? 'btn' : 'btn-outline'}
										disabled={is_full}
										onClick={() => setSelectedSlotId(slot.id)}
									>
										{time_value} {is_full ? '(Full)' : ''}
									</button>
								);
							})}
						</div>
					</>
				) : (
					<div className='card-grid'>
						<input
							className='input'
							placeholder='Address line 1'
							value={delivery_address_line1}
							onChange={(event) => setDeliveryAddressLine1(event.target.value)}
						/>
						<input
							className='input'
							placeholder='Address line 2'
							value={delivery_address_line2}
							onChange={(event) => setDeliveryAddressLine2(event.target.value)}
						/>
						<input
							className='input'
							placeholder='City'
							value={delivery_city}
							onChange={(event) => setDeliveryCity(event.target.value)}
						/>
						<input
							className='input'
							placeholder='Postcode'
							value={delivery_postcode}
							onChange={(event) => setDeliveryPostcode(event.target.value)}
						/>
					</div>
				)}

				{error && <p className='pill status-red'>{error}</p>}

				<button
					type='button'
					className='btn btn-full mt-1'
					disabled={
						placing_order ||
						cart_items.length === 0 ||
						(fulfilment_type === 'collection' && !selected_slot_id)
					}
					onClick={handlePlaceOrder}
				>
					{placing_order ? 'Placing order...' : 'Place order'}
				</button>
			</div>
		</section>
	);
}
