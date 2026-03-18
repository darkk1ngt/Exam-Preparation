import { useState } from 'react';

/**
 * Reusable product card.
 *
 * Props:
 *   img        – image URL
 *   alt        – img alt text (falls back to name)
 *   name       – product name
 *   farm       – farm name
 *   weight     – weight string (e.g. '1kg')
 *   price      – price string (e.g. '£1.80')
 *   outOfStock – boolean; shows 'Out of Stock' and disables controls
 *   onClick    – called when card is clicked (for navigation)
 *   onAdd      – called with quantity when Add button is clicked
 */
const ProductCard = ({ img, alt, name, farm, weight, price, outOfStock = false, onClick, onAdd }) => {
  const [qty, setQty] = useState(1);

  const handleAdd = (e) => {
    e.stopPropagation();
    if (onAdd) onAdd(qty);
  };

  const cardStyle = {
    ...(outOfStock ? {opacity: 0.65} : {}),
    ...(onClick ? {cursor: 'pointer'} : {}),
  };

  return (
    <div className="product-card" style={cardStyle} onClick={onClick}>
      <div className="product-img" style={{height:'130px', overflow:'hidden'}}>
        <img src={img} alt={alt || name} style={{width:'100%', height:'100%', objectFit:'cover'}} />
        <button className="fav-btn" onClick={e => e.stopPropagation()}>♡</button>
      </div>
      <div className="product-body">
        <div className="product-name">{name}</div>
        <div className="product-farm">{farm}</div>
        <div className="product-weight">{weight}</div>
        <div className="product-price" style={outOfStock ? {color:'#999'} : {}}>
          {outOfStock ? 'Out of Stock' : price}
        </div>
        <div className="add-row">
          <span className="qty-label">Qty.</span>
          <input
            type="number"
            className="qty-input"
            value={qty}
            min="1"
            onChange={e => setQty(Math.max(1, parseInt(e.target.value) || 1))}
            onClick={e => e.stopPropagation()}
            disabled={outOfStock}
          />
          <button className="add-btn" disabled={outOfStock} onClick={handleAdd}>
            {outOfStock ? 'Notify Me' : 'Add'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
