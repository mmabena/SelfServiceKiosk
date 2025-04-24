import React, { useState } from "react";
import axios from "axios";

const AddProductForm = ({ onAddProduct }) => {
  const [newProduct, setNewProduct] = useState({
    ProductName: "",
    ProductDescription: "",
    UnitPrice: "",
    Available: "", // No default, user must input
    Quantity: 0,
    CategoryId: 1,
    ProductImage: "", // For dropdown
  });

  const [imageFile, setImageFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewProduct((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const parsedUnitPrice = parseFloat(newProduct.UnitPrice);
    if (isNaN(parsedUnitPrice) || parsedUnitPrice <= 0) {
      setMessage("Please enter a valid unit price greater than zero.");
      return;
    }

    const formData = new FormData();
    formData.append("ProductName", newProduct.ProductName);
    formData.append("ProductDescription", newProduct.ProductDescription);
    formData.append("UnitPrice", parsedUnitPrice);
    formData.append("Available", newProduct.Available); // String: "yes" or "no"
    formData.append("Quantity", newProduct.Quantity);
    formData.append("CategoryId", newProduct.CategoryId);
    formData.append("ProductImage", newProduct.ProductImage); // Dropdown option

    if (imageFile) {
      formData.append("imageFile", imageFile);
    }

    try {
      const response = await axios.post("http://localhost:5219/api/product/addProduct", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: "Bearer YOUR_ACCESS_TOKEN", // Replace if needed
        },
      });

      onAddProduct(response.data);
      setMessage("Product added successfully!");
      setNewProduct({
        ProductName: "",
        ProductDescription: "",
        UnitPrice: "",
        Available: "",
        Quantity: 0,
        CategoryId: 1,
        ProductImage: "",
      });
      setImageFile(null);
    } catch (error) {
      setMessage(`Error adding product: ${error.response?.data || error.message}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <input
          type="text"
          name="ProductName"
          value={newProduct.ProductName}
          onChange={handleChange}
          placeholder="Product Name"
          required
        />
      </div>
      <div>
        <input
          type="text"
          name="ProductDescription"
          value={newProduct.ProductDescription}
          onChange={handleChange}
          placeholder="Product Description"
          required
        />
      </div>
      <div>
        <input
          type="number"
          name="UnitPrice"
          value={newProduct.UnitPrice}
          onChange={handleChange}
          placeholder="Unit Price"
          step="any"
          required
        />
      </div>
      <div>
        <input
          type="text"
          name="Available"
          value={newProduct.Available}
          onChange={handleChange}
          placeholder="Available (yes/no)"
          required
        />
      </div>
      <div>
        <input
          type="number"
          name="Quantity"
          value={newProduct.Quantity}
          onChange={handleChange}
          placeholder="Quantity"
          required
        />
      </div>
      <div>
        <label>Product Image</label>
        <select
          name="ProductImage"
          value={newProduct.ProductImage}
          onChange={handleChange}
          required
        >
          <option value="">Select Product Image Option</option>
          <option value="yes">Yes</option>
          <option value="no">No</option>
        </select>
      </div>
      <div>
        <input
          type="file"
          onChange={handleImageChange}
          accept="image/*"
          required
        />
      </div>
      <button type="submit">Add Product</button>
      {message && <p>{message}</p>}
    </form>
  );
};

export default AddProductForm;
