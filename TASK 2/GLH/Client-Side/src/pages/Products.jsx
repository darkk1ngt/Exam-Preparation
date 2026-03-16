import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import config from '../config.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useFetch } from '../hooks/useFetch.js';

const category_options = ['All', 'Dairy', 'Vegetables', 'Meat', 'Fruit', 'Eggs'];

const placeholder_image =
	'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360"><rect width="100%" height="100%" fill="%23EAF2E3"/><text x="50%" y="50%" fill="%234A7C2F" font-size="26" font-family="Arial" text-anchor="middle" dominant-baseline="middle">No image</text></svg>';

export default function Products() {
	const navigate = useNavigate();
	const { user } = useAuth();
	const [search_term, setSearchTerm] = useState('');
	const [category, setCategory] = useState('All');
	const [adding_product_id, setAddingProductId] = useState(null);
	const [cart_error, setCartError] = useState('');

	const url = useMemo(() => {
		const params = new URLSearchParams();
		if (search_term.trim()) {
			params.set('search', search_term.trim());
		}
		if (category !== 'All') {
			params.set('category', category);
		}
		const qs = params.toString();
		return `/api/products${qs ? `?${qs}` : ''}`;
	}, [search_term, category]);

	const { data, loading, error: fetch_error } = useFetch(url);
	const products = data?.products ?? [];
	const error = fetch_error || cart_error;

	const handleAddToCart = async (product_id) => {
		if (!user) {
			navigate('/login');
			return;
		}

		setAddingProductId(product_id);
		setCartError('');
		try {
			const response = await fetch(`${config.apiUrl}/api/cart`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
				body: JSON.stringify({ product_id, quantity: 1 }),
			});

			if (!response.ok) {
				const body = await response.json();
				throw new Error(body.error || 'Unable to add item to cart.');
			}

			navigate('/checkout');
		} catch (add_error) {
			setCartError(add_error.message);
		} finally {
			setAddingProductId(null);
		}
	};

	return (
		<section className='card-grid'>
			<header className='card'>
				<h1>Customer Product Browsing</h1>
				<div className='split-layout'>
					<div>
						<label htmlFor='search_term'>Search products</label>
						<input
							id='search_term'
							className='input'
							placeholder='Search by name or description'
							value={search_term}
							onChange={(event) => setSearchTerm(event.target.value)}
						/>
					</div>
					<div>
						<label htmlFor='category'>Category</label>
						<select
							id='category'
							className='select'
							value={category}
							onChange={(event) => setCategory(event.target.value)}
						>
							{category_options.map((option) => (
								<option key={option} value={option}>
									{option}
								</option>
							))}
						</select>
					</div>
				</div>
				<div className='category-row' style={{ marginTop: '0.75rem' }}>
					{category_options.map((option) => (
						<button
							key={option}
							type='button'
							className={`category-pill ${category === option ? 'active' : ''}`}
							onClick={() => setCategory(option)}
						>
							{option}
						</button>
					))}
				</div>
			</header>

			{error && <p className='status-red pill'>{error}</p>}

			{loading ? (
				<p>Loading products...</p>
			) : (
				<div className='products-grid'>
					{products.map((product) => {
						const is_available = Boolean(product.is_available) && product.stock_quantity > 0;
						return (
							<article className='card product-card' key={product.id}>
								<img
									className='product-image'
									src={product.image_url || placeholder_image}
									alt={product.name}
								/>
								<h3>{product.name}</h3>
								<p>Farm: {product.producer_farm || 'Not specified'}</p>
								<p>
									<strong>£{Number(product.price).toFixed(2)}</strong>
								</p>
								<span className={`pill ${is_available ? 'pill-green' : 'pill-red'}`}>
									{is_available ? 'In stock' : 'Unavailable'}
								</span>
								<button
									type='button'
									className={is_available ? 'btn' : 'btn-outline'}
									disabled={!is_available || adding_product_id === product.id}
									onClick={() => handleAddToCart(product.id)}
								>
									{adding_product_id === product.id ? 'Adding...' : 'Add to cart'}
								</button>
							</article>
						);
					})}
				</div>
			)}
		</section>
	);
}
