import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ProductBrowsing() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [page, setPage] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, [search, category, page]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/api/products?page=${page}&limit=12`;
      if (category !== 'all') url += `&category=${category}`;
      if (search) url += `&search=${search}`;

      const res = await fetch(url, { credentials: 'include' });
      const data = await res.json();
      setProducts(data.products);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  const addToCart = async (productId) => {
    try {
      await fetch('/api/cart', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId, quantity: 1 })
      });
      alert('Added to cart!');
    } catch (err) {
      alert('Failed to add to cart');
    }
  };

  return (
    <div className="page">
      <h1>Shop Local Produce</h1>

      <div className="card" style={{ marginBottom: '2rem' }}>
        <div className="form-group">
          <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="all">All</option>
            <option value="Dairy">Dairy</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Meat">Meat</option>
            <option value="Fruit">Fruit</option>
            <option value="Eggs">Eggs</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="loading-container"><div className="spinner"></div></div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>No products found</div>
      ) : (
        <div className="menu-grid">
          {products.map(product => (
            <div key={product.id} className="menu-card">
              <div className="menu-card-image">{product.image_url ? <img src={product.image_url} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : '🌾'}</div>
              <div className="menu-card-body">
                <h3 className="menu-card-title">{product.name}</h3>
                <p className="menu-card-subtitle">{product.category}</p>
                <p style={{ marginBottom: '1rem', color: '#666', fontSize: '14px' }}>{product.description}</p>
                <p className="menu-card-price">£{parseFloat(product.price).toFixed(2)}</p>
                <div style={{ marginBottom: '1rem' }}>
                  {product.is_available ? (
                    <span className="badge badge-success">In stock</span>
                  ) : (
                    <span className="badge badge-error">Unavailable</span>
                  )}
                </div>
                <button
                  className="btn btn-primary btn-block"
                  onClick={() => addToCart(product.id)}
                  disabled={!product.is_available}
                  style={{ opacity: product.is_available ? 1 : 0.5 }}
                >
                  {product.is_available ? 'Add to Cart' : 'Out of Stock'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="btn btn-primary" onClick={() => navigate('/cart')} style={{ marginTop: '2rem' }}>
        View Cart →
      </button>
    </div>
  );
}
