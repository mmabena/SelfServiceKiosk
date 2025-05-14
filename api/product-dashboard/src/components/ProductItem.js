import React, { useState } from "react";

const ProductItem = ({ product, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [updatedProduct, setUpdatedProduct] = useState({ ...product });

  const handleUpdate = () => {
    onUpdate(product.ProductId, updatedProduct);
    setIsEditing(false);
  };

  return (
    <div className="product-item">
      {isEditing ? (
        <div>
          <input
            type="text"
            value={updatedProduct.ProductName}
            onChange={(e) =>
              setUpdatedProduct({
                ...updatedProduct,
                ProductName: e.target.value,
              })
            }
          />
          <button onClick={handleUpdate}>Update</button>
        </div>
      ) : (
        <div>
          <h3>{product.ProductName}</h3>
          <p>{product.ProductDescription}</p>
          <p>${product.UnitPrice}</p>

          {/* Display Product Image */}
          {product.ProductImage ? (
            <img
              src={product.ProductImage}
              alt={product.ProductName}
              className="product-image"
            />
          ) : (
            <p>No image available</p> // Fallback text if no image is provided
          )}

          <button onClick={() => setIsEditing(true)}>Edit</button>
          <button onClick={() => onDelete(product.ProductId)}>Delete</button>
        </div>
      )}
    </div>
  );
};

export default ProductItem;
