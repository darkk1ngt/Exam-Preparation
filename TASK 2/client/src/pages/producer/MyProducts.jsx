import { useState, useEffect } from 'react';

export default function MyProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', category: '', price: '', stock_quantity: '' });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/dashboard/products', { credentials: 'include' });
      const data = await res.json();
      setProducts(data.products);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAvailability = async (id) => {
    try {
      await fetch(`/api/dashboard/products/${id}/toggle`, { method: 'PATCH', credentials: 'include' });
      fetchProducts();
    } catch (err) {
      alert('Failed to toggle');
    }
  };

  const deleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await fetch(`/api/dashboard/products/${id}`, { method: 'DELETE', credentials: 'include' });
      fetchProducts();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const addProduct = async () => {
    try {
      await fetch('/api/dashboard/products', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProduct)
      });
      setNewProduct({ name: '', description: '', category: '', price: '', stock_quantity: '' });
      setAdding(false);
      fetchProducts();
    } catch (err) {
      alert('Failed to add product');
    }
  };

  if (loading) return <div className="page"><div className="loading-container"><div className="spinner"></div></div></div>;

  return (
    <div className="page">
      <h1>My Products</h1>

      {!adding ? (
        <button className="btn btn-primary" onClick={() => setAdding(true)} style={{ marginBottom: '1rem' }}>+ Add Product</button>
      ) : (
        <div className="card" style={{ marginBottom: '1rem' }}>
          <h3>Add New Product</h3>
          <div className="form-group">
            <label>Name</label>
            <input type="text" value={newProduct.name} onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={newProduct.description} onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}></textarea>
          </div>
          <div className="form-group">
            <label>Category</label>
            <input type="text" value={newProduct.category} onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Price (£)</label>
            <input type="number" value={newProduct.price} onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Stock Quantity</label>
            <input type="number" value={newProduct.stock_quantity} onChange={(e) => setNewProduct({ ...newProduct, stock_quantity: e.target.value })} />
          </div>
          <button className="btn btn-primary" onClick={addProduct} style={{ marginRight: '0.5rem' }}>Save</button>
          <button className="btn btn-secondary" onClick={() => setAdding(false)}>Cancel</button>
        </div>
      )}

      <div className="card">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Available</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map(product => (
              <tr key={product.id}>
                <td>{product.name}</td>
                <td>{product.category}</td>
                <td>£{parseFloat(product.price).toFixed(2)}</td>
                <td>
                  <span className={`badge ${product.stock_quantity < 5 ? 'badge-warning' : 'badge-success'}`}>
                    {product.stock_quantity}
                  </span>
                </td>
                <td>
                  <button
                    className="pill"
                    onClick={() => toggleAvailability(product.id)}
                    style={{ backgroundColor: product.is_available ? 'var(--color-success)' : '#ccc', color: 'white' }}
                  >
                    {product.is_available ? 'Available' : 'Unavailable'}
                  </button>
                </td>
                <td>
                  <button className="btn btn-sm btn-warning" style={{ marginRight: '0.25rem' }}>Edit</button>
                  <button className="btn btn-sm btn-danger" onClick={() => deleteProduct(product.id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
