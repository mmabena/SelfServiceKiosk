import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import "../LoginSignup.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [productDetails, setProductDetails] = useState({
    productId: "",
    productName: "",
    productDescription: "",
    unitPrice: "",
    available: "",
    quantity: "",
    categoryId: "",
    imageFile: "",
    isActive: true,
  });
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [uploading, setUploading] = useState(false);
  const updateFormRef = useRef(null);
  const addFormRef = useRef(null);

  const productsPerPage = 5;

  const totalPages = Math.ceil(products.length / productsPerPage);
  const paginatedProducts = products.slice(
    (currentPage - 1) * productsPerPage,
    currentPage * productsPerPage
  );

  useEffect(() => {
    fetchCategories();
    fetchAllProducts(); // Call fetchAllProducts inside useEffect
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5219/api/productcategory");
      setCategories(res.data);
    } catch (err) {
      console.error("Failed to fetch categories:", err);
      setErrorMessage("Failed to load categories.");
    }
  };

  // Fetch all products (not just active ones)
  const fetchAllProducts = async () => {
    try {
      const res = await axios.get("http://localhost:5219/api/product");
      // Ensure isActive is explicitly a boolean (true/false)
      const normalized = res.data.map((p) => ({
        ...p,
        isActive: p.isActive === true || p.isActive === "true", // Explicitly set to boolean
      }));
      setProducts(normalized);
      setErrorMessage(""); // Clear error message
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setErrorMessage("Failed to load products.");
    }
  };

  const toggleProductActive = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Authentication token is missing.");
      return;
    }

    try {
      await axios.put(
        `http://localhost:5219/api/product/${productId}/toggle-active`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      fetchAllProducts();
      toast.success("Product status updated.");
    } catch (err) {
      console.error("Error:", err.response?.data || err.message);
      if (err.response?.status === 403) {
        toast.error("You are unauthorised to perform this action.");
      } else {
        toast.error("Failed to toggle product status.");
      }
    }
  };

  const clearForm = () => {
    setProductDetails({
      productId: "",
      productName: "",
      productDescription: "",
      unitPrice: "",
      available: "",
      quantity: "",
      categoryId: "",
      imageFile: "",
      isActive: true,
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file && (file.type === "image/jpeg" || file.type === "image/jpg")) {
      try {
        setUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", "unsigned_preset");
        formData.append("folder", "samples/ecommerce");

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/djmafre5k/image/upload",
          formData
        );

        const imageUrl = response.data.secure_url;
        setProductDetails((prev) => ({ ...prev, imageFile: imageUrl }));
        setUploading(false);
      } catch (error) {
        console.error("Error uploading image:", error);
        setErrorMessage("Error uploading image.");
        setUploading(false);
      }
    } else {
      setErrorMessage("Only .jpg or .jpeg images are allowed.");
      setProductDetails((prev) => ({ ...prev, imageFile: null }));
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const {
      productName,
      productDescription,
      unitPrice,
      available,
      quantity,
      categoryId,
      imageFile,
    } = productDetails;

    if (
      !productName ||
      !productDescription ||
      isNaN(unitPrice) ||
      unitPrice <= 0 ||
      !available ||
      isNaN(quantity) ||
      quantity < 0 ||
      isNaN(categoryId) ||
      categoryId <= 0 ||
      !imageFile
    ) {
      setErrorMessage("Please fill all fields correctly.");
      return;
    }

    // Check if a product with the same name already exists (case-insensitive)
    const duplicate = products.find(
      (p) =>
        p.productName.toLowerCase().trim() === productName.toLowerCase().trim()
    );
    if (duplicate) {
      setErrorMessage("A product with this name already exists.");
      toast.error("Duplicate product.Cannot be added.");
      return;
    }

    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("productDescription", productDescription);
    formData.append("unitPrice", unitPrice);
    formData.append("available", available);
    formData.append("quantity", quantity);
    formData.append("categoryId", categoryId);
    formData.append("productImage", imageFile);

    try {
      await axios.post(
        "http://localhost:5219/api/product/addProduct",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Product added successfully!");
      clearForm();
      setIsAddingProduct(false); // <-- Close the form
      fetchAllProducts();
    } catch (err) {
      console.error("Add error:", err.response?.data || err.message);

      if (err.response?.status === 403) {
        toast.error("You are not authorized to perform this action.");
      } else {
        toast.error("Failed to add product.");
      }
    }
  };

  const handleUpdateProduct = async (productId) => {
    const token = localStorage.getItem("token");
    if (!token) {
      setErrorMessage("Authentication token is missing.");
      return;
    }

    const {
      productName,
      productDescription,
      unitPrice,
      available,
      quantity,
      categoryId,
      imageFile,
    } = productDetails;

    if (
      !productName ||
      !productDescription ||
      isNaN(unitPrice) ||
      unitPrice <= 0 ||
      !available ||
      isNaN(quantity) ||
      quantity < 0 ||
      isNaN(categoryId) ||
      categoryId <= 0 ||
      !imageFile
    ) {
      setErrorMessage("Please fill all fields correctly.");
      return;
    }

    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("productDescription", productDescription);
    formData.append("unitPrice", unitPrice);
    formData.append("available", available);
    formData.append("quantity", quantity);
    formData.append("categoryId", categoryId);
    formData.append("productImage", imageFile);
    try {
      await axios.put(
        `http://localhost:5219/api/product/${productId}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Product updated successfully!");
      clearForm();
      fetchAllProducts();
      setProductDetails((prev) => ({ ...prev, productId: "" }));
    } catch (err) {
      console.error("Update error:", err.response?.data || err.message);

      if (err.response?.status === 403) {
        toast.error("You are not authorized to perform this action.");
      } else {
        toast.error("Failed to update product.");
      }
    }
  };

  return (
    <div className="product-table-container">
      <ToastContainer position="bottom-right" autoClose={4000} />
      <h2>All Products</h2>
<div className="product-actions">
  <button
    onClick={() => {
      setIsAddingProduct(true);
      clearForm();
      setTimeout(() => {
        addFormRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);
    }}
  >
    Add Product
  </button>
</div>


      {errorMessage && <p style={{ color: "red" }}>{errorMessage}</p>}

      <div className="table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Description</th>
              <th>Image URL</th>
              
              <th>Price</th>
              <th>Quantity</th>
              <th>Active</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedProducts.map((product) => (
              <tr key={product.productId}>
                <td>{product.productName}</td>
                <td>
                  {categories.find((c) => c.categoryId === product.categoryId)
                    ?.categoryName || "Unknown"}
                </td>
                <td>{product.productDescription}</td>
                <td>{product.productImage}</td>
              
                <td>{product.unitPrice}</td>
                <td>{product.quantity}</td>
                <td>
                  <input
                    type="checkbox"
                    checked={product.isActive} // Dynamically set based on the isActive value
                    onChange={() => toggleProductActive(product.productId)}
                    // style={{
                    //   appearance: "auto",
                    //   width: "15px",
                    //   height: "15px",
                    // }} // Style adjustments
                  />
                </td>

                <td>
  <div className="product-actions">
    <button
      className="product-actions-button"
      onClick={() => {
        setProductDetails({
          productId: product.productId,
          productName: product.productName,
          productDescription: product.productDescription,
          unitPrice: product.unitPrice,
          available: product.available,
          quantity: product.quantity,
          categoryId: product.categoryId,
          imageFile: product.productImage,
          isActive: product.isActive,
        });
        setTimeout(() => {
          updateFormRef.current?.scrollIntoView({
            behavior: "smooth",
          });
        }, 100);
      }}
    >
      Update
    </button>
  </div>
</td>

              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages}
        >
          Next
        </button>
      </div>

      {productDetails.productId && (
        <div ref={updateFormRef} className="update-form-container">
          <h3>Update Product</h3>
          <form
            className="update-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleUpdateProduct(productDetails.productId);
            }}
          >
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={productDetails.productName}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    productName: e.target.value,
                  })
                }
                placeholder="Enter product name"
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={productDetails.productDescription}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    productDescription: e.target.value,
                  })
                }
                placeholder="Enter product description"
                required
              />
            </div>

            <div className="form-group">
              <label>Price</label>
              <input
                type="number"
                value={productDetails.unitPrice}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    unitPrice: e.target.value,
                  })
                }
                placeholder="Enter price"
                required
              />
            </div>

            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={productDetails.quantity}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    quantity: e.target.value,
                  })
                }
                placeholder="Enter quantity"
                required
              />
            </div>

            <div className="form-group">
              <label>Product Image</label>
              <input
                type="file"
                accept=".jpg,.jpeg"
                onChange={handleFileChange}
              />
              {uploading && <p>Uploading image...</p>}
              {productDetails.imageFile && (
                <div style={{ marginTop: "10px" }}>
                  <img
                    src={productDetails.imageFile}
                    alt="Preview"
                    style={{ maxWidth: "200px", borderRadius: "5px" }}
                  />
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Category</label>
              <select
                value={productDetails.categoryId}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    categoryId: e.target.value,
                  })
                }
                required
              >
                <option value="">Select Category</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Availability</label>
              <input
                type="text"
                value={productDetails.available}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    available: e.target.value,
                  })
                }
                placeholder="Available/Not Available"
                required
              />
            </div>

            <button type="submit"  className="btn-blue">
              Update Product
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                clearForm();
              }}
              style={{ marginLeft: "10px", backgroundColor: "#ccc" }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {isAddingProduct && (
        <div ref={addFormRef} className="add-form-container">
          <h3>Add Product</h3>
          <form className="add-form" onSubmit={handleAddProduct}>
            {/* Add Product Form Fields */}
            <div className="form-group">
              <label>Product Name</label>
              <input
                type="text"
                value={productDetails.productName}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    productName: e.target.value,
                  })
                }
                placeholder="Enter product name"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={productDetails.productDescription}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    productDescription: e.target.value,
                  })
                }
                placeholder="Enter product description"
                required
              />
            </div>
            <div className="form-group">
              <label>Unit Price</label>
              <input
                type="number"
                value={productDetails.unitPrice}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    unitPrice: e.target.value,
                  })
                }
                placeholder="Enter unit price"
                required
              />
            </div>
            <div className="form-group">
              <label>Available</label>
              <select
                value={productDetails.available}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    available: e.target.value,
                  })
                }
                required
              >
                <option value="">Select availability</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
              </select>
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input
                type="number"
                value={productDetails.quantity}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    quantity: e.target.value,
                  })
                }
                placeholder="Enter quantity"
                required
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select
                value={productDetails.categoryId}
                onChange={(e) =>
                  setProductDetails({
                    ...productDetails,
                    categoryId: e.target.value,
                  })
                }
                required
              >
                <option value="">Select category</option>
                {categories.map((category) => (
                  <option key={category.categoryId} value={category.categoryId}>
                    {category.categoryName}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Image</label>
              <input type="file" onChange={handleFileChange} />
              {uploading && <p>Uploading...</p>}
            </div>
            <div className="form-group">
              <label>Status</label>
              <input
                type="checkbox"
                checked={productDetails.isActive}
                onChange={() =>
                  setProductDetails({
                    ...productDetails,
                    isActive: !productDetails.isActive,
                  })
                }
              />
            </div>
            <button type="submit" className="btn-blue">Add Product</button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => {
                setIsAddingProduct(false); // Hide form
                clearForm(); // Optional: reset again
              }}
              style={{ marginTop: "10px", backgroundColor: "#ccc" }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageProducts;
