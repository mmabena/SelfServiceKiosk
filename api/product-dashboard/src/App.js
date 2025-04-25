import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // <-- Import useNavigate
import "./LoginSignup.css";
import Sidebar from "./components/SideBar";
import LogoutButton from "./components/LogoutButton";
import logo from './Self-Service-Kiosk-Logo/Self-Service-Kiosk-Logo.png'; // Adjust the path if necessary



const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userDetails, setUserDetails] = useState({ role: "" });
  const [activeTab, setActiveTab] = useState("login");
  const [products, setProducts] = useState([]);
  const [dashboardTab, setDashboardTab] = useState("landing");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const toggleSidebar = () => setIsSidebarOpen(prev => !prev);

const LandingPage = () => {
  return (
    <div className="landing">
      {/* Display the logo at the top */}
      <img src={logo} alt="Self-Service Kiosk Logo" className="landing-logo" />
      <h1>Welcome to the Self-Service Kiosk</h1>
      <p>Please choose an option from the menu to get started.</p>
    </div>
  );
};
  const handleAddToCart = (product) => {
    // You can push this into a cart state later
    console.log("Adding to cart:", product.productName);
    alert(`Added "${product.productName}" to cart!`);
  };
  

  const [productDetails, setProductDetails] = useState({
    productName: "",
    productDescription: "",
    unitPrice: "",
    available: "",
    quantity: "",
    categoryId: 1,
    productImage: "no", // "yes" or "no"
    imageFile: null, // actual uploaded image file
  });

  const [searchId, setSearchId] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const [loginDetails, setLoginDetails] = useState({
    username: "",
    password: "",
  });
  const [registerDetails, setRegisterDetails] = useState({
    username: "",
    name: "",
    lastname: "",
    password: "",
    email: "",
    role: "",
  });
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false); // Flag to track if search was performed

  const navigate = useNavigate(); // <-- Initialize the navigate function

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    setToken(null);
    navigate("/login"); // or wherever your login route is
  };
  useEffect(() => {
    const validateToken = async () => {
      const savedToken = localStorage.getItem("token");

      if (!savedToken || savedToken === "mock-token") {
        setIsLoggedIn(false);
        return;
      }

      try {
        const res = await axios.post(
          "http://localhost:5219/api/user/validate",
          {},
          {
            headers: { Authorization: `Bearer ${savedToken}` },
          }
        );

        if (res.status === 200) {
          setToken(savedToken);
          setIsLoggedIn(true);

          // Fetch user role after token validation (if needed)
          const userRoleRes = await axios.get(
            "http://localhost:5219/api/auth/userRole",
            {
              headers: { Authorization: `Bearer ${savedToken}` },
            }
          );
          setUserDetails({ role: userRoleRes.data.role });
        } else {
          setIsLoggedIn(false);
          localStorage.removeItem("token");
        }
      } catch (err) {
        setIsLoggedIn(false);
        localStorage.removeItem("token");
      }
    };

    validateToken();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/products");
    }
  }, [isLoggedIn, navigate]);

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5219/api/product");
      setProducts(response.data);
    } catch (error) {
      handleError(error);
    }
  };

  const fetchProductById = async () => {
    if (!searchId.trim()) return setErrorMessage("Product ID is required.");
    try {
      const response = await axios.get(
        `http://localhost:5219/api/product/${searchId}`
      );
      setProducts([response.data]);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Product not found.");
      setProducts([]);
    }
  };

  const fetchProductsByCategory = async () => {
    if (!searchCategory.trim())
      return setErrorMessage("Category name is required.");
    try {
      const response = await axios.get(
        `http://localhost:5219/api/product/byCategory?name=${searchCategory}`
      );
      if (response.data.length === 0) {
        setErrorMessage("No products found for that category.");
      } else {
        setProducts(response.data);
        setErrorMessage("");
      }
    } catch (error) {
      setErrorMessage("Error fetching products.");
      setProducts([]);
    }
  };

  const handleProductInputChange = (e) => {
    const { name, value } = e.target;
    setProductDetails((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  {
    /* logic for saving the actual file image in jpg format and returnng a URL to put in the database as the database for product image is a string*/
  }
  const handleFileChange = async (e) => {
    const file = e.target.files[0]; // Get the file from the input
    if (file && (file.type === "image/jpeg" || file.type === "image/jpg")) { // Allow both jpeg and jpg
      try {
        // Prepare the form data for Cloudinary
        const formData = new FormData();
        formData.append("file", file); // Use the selected file (not imageFile)
        formData.append("upload_preset", "unsigned_preset"); // your Cloudinary unsigned preset
        formData.append("folder", "samples/ecommerce"); // folder inside Cloudinary to store the image
        
        // Upload the image to Cloudinary
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/djmafre5k/image/upload", // your cloud name
          formData
        );
        
        // This will be the full image URL you can store in your database
        const imageUrl = response.data.secure_url;
        
        // Update the state with the image URL
        setProductDetails((prev) => ({ ...prev, imageFile: imageUrl }));
        setErrorMessage(""); // Clear any previous error messages
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        setErrorMessage("Error uploading image.");
      }
    } else {
      setErrorMessage("Only .jpg or .jpeg images are allowed.");
      setProductDetails((prev) => ({ ...prev, imageFile: null }));
    }
};

  
  
  
const handleAddProduct = async (e) => {
  e.preventDefault();

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
    quantity <= 0 ||
    isNaN(categoryId) ||
    categoryId <= 0
  ) {
    setErrorMessage("Please fill all fields correctly.");
    return;
  }

  const formData = new FormData();
  formData.append('productName', productName);
  formData.append('productDescription', productDescription);
  formData.append('unitPrice', unitPrice);
  formData.append('available', available);
  formData.append('quantity', quantity);
  formData.append('categoryId', categoryId);

  formData.append("productImage", imageFile ? "yes" : "");

  // formData.append("ProductImage", imageFile ? imageFile : "");


  if (imageFile && imageFile instanceof File) {
    formData.append('imageFile', imageFile);
  }

  for (let pair of formData.entries()) {
    console.log(`${pair[0]}:`, pair[1]);
  }

  try {
    const res = await axios.post("http://localhost:5219/api/product/addProduct", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log("Product added:", res.data);
    alert("Product added successfully!");
    clearForm();
  } catch (err) {
    console.error("Add product error:", err.response?.data || err.message);
    setErrorMessage("Failed to add product.");
  }
};





const handleUpdateProduct = async (e) => {
  e.preventDefault();

  if (!searchId || isNaN(searchId)) {
    setErrorMessage("Please enter a valid Product ID.");
    return;
  }

  const {
    productId = searchId,
    productName,
    productDescription,
    unitPrice,
    available,
    quantity,
    categoryId,
    productImage, // Cloudinary URL or file
    imageFile, // New image file to be uploaded (optional)
  } = productDetails;

  let formData = new FormData();

  // Add product fields to form data
  formData.append('productId', productId);
  formData.append('productName', productName);
  formData.append('productDescription', productDescription);
  formData.append('unitPrice', unitPrice);
  formData.append('available', available);
  formData.append('quantity', quantity);
  formData.append('categoryId', categoryId);
  formData.append('productImage', productImage); // Include Cloudinary URL or current image data

  // If the image file exists, append it to the form data (it will be handled by backend)
  if (imageFile) {
    formData.append('imageFile', imageFile);
  }

  try {
    const res = await axios.put(
      `http://localhost:5219/api/product/${searchId}`,
      formData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      }
    );

    console.log("Product updated:", res.data);
    alert("Product updated successfully!");
    clearForm();
  } catch (err) {
    console.error("Update product error:", err);
    setErrorMessage("Failed to update product.");
  }
};



  {
    /* logic for deleting a product via product id and name as well as a prompt to make sure the user wants to delete the product*/
  }
  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Delete ${name}?`)) return;

    try {
      await axios.delete(`http://localhost:5219/api/product/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("Deleted successfully.");
      fetchAllProducts();
    } catch (error) {
      handleError(error);
    }
  };
  {
    /* logic for handling server errors so user knows what the problem is*/
  }
  const handleError = (error) => {
    if (error.response?.status === 401) {
      setErrorMessage("Unauthorized. Please log in.");
    } else if (error.response?.status === 404) {
      setErrorMessage("Not found.");
    } else if (error.response?.status === 403) {
      setErrorMessage("You are not authorized to perform this action");
    } else {
      setErrorMessage("An error occurred.");
    }
  };

  const clearForm = () => {
    setProductDetails({
      productName: "",
      productDescription: "",
      unitPrice: "",
      available: "",
      quantity: "",
      categoryId: 1,
      productImage: "no",
      imageFile: null,
    });
    setSearchId("");
    setSearchCategory("");
    setErrorMessage("");
    setSearchPerformed(false);
  };

  const handleLoginChange = (e) => {
    setLoginDetails({ ...loginDetails, [e.target.name]: e.target.value });
  };

  const handleRegisterChange = (e) => {
    setRegisterDetails({ ...registerDetails, [e.target.name]: e.target.value });
  };
  {
    /* logic for handling the login and receiving & saving the user token for authorization*/
  }
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5219/api/user/login",
        loginDetails
      );

      console.log(response.data); // Log the response for debugging purposes

      if (response.data && response.data.token) {
        setToken(response.data.token); // Save the token
        localStorage.setItem("token", response.data.token); // Store token in localStorage
        setIsLoggedIn(true); // Set user as logged in
        alert("Login successful");

        // After successful login, navigate to the products page
        setDashboardTab("landing"); // <- Show the Landing Page

      } else {
        setErrorMessage("Login failed: No token returned.");
      }
    } catch (error) {
      console.error("Login error: ", error);
      if (error.response) {
        // Log the response to see more detailed error information
        console.log("Error response: ", error.response);
        const errorMessage =
          error.response.data?.message || "Invalid credentials.";
        setErrorMessage(errorMessage);
      } else {
        setErrorMessage("An error occurred during login.");
      }
      setLoginDetails({
        username: "",
        password: "",
      });
    }
  };
  {
    /* logic for handling registration and redirecting to the login page when registration is successful*/
  }
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        "http://localhost:5219/api/user/register",
        registerDetails
      );
      alert("Registration successful!");
      setActiveTab("login"); // Switch to login tab on successful registration
    } catch (error) {
      setErrorMessage("Error registering.");
      setRegisterDetails({
        username: "",
        name: "",
        lastname: "",
        password: "",
        email: "",
        role: "",
      });
    }
  };
  {
    /* logic to clear any output when the user chooses a different page/tab as well as ensuring for search that no products show until the search input has been returned*/
  }
  useEffect(() => {
    clearForm();

    if (["all", "delete"].includes(activeTab)) {
      fetchAllProducts();
      setSearchPerformed(true); // show products list
    } else {
      setProducts([]); // Clear previous results
      setSearchPerformed(false); // Prevent showing products until search is done
    }
  }, [activeTab]);
  const handleMenuClick = (tab) => {
    setDashboardTab(tab);
    setActiveTab(tab);
  };

  return (
    <div className="wrapper">
      {/* Show Sidebar and LogoutButton ONLY when logged in */}
      {isLoggedIn && (
        <>
             <button className="sidebar-toggle" onClick={toggleSidebar}>
        ☰ Menu
      </button>
      <Sidebar
  isLoggedIn={token !== null} // Pass logged-in status
  userRole={userDetails.role}  // Pass user role
  onMenuClick={handleMenuClick} // Handle menu item click
  isOpen={isSidebarOpen}  // Pass down isSidebarOpen to control sidebar visibility
  setIsOpen={setIsSidebarOpen} // Pass setIsOpen to Sidebar to control the sidebar open/close state
/>
          <LogoutButton onLogout={handleLogout} />
          {/* Landing Page Logic */}
          {dashboardTab === "landing" && <LandingPage />}
        </>
      )}
      {!isLoggedIn ? (
        <>
          <div className="title-text">
            <div
              className={`title login ${activeTab === "login" ? "active" : ""}`}
              onClick={() => setActiveTab("login")}
            >
              {/* Login Form set up */}
            </div>
            <div
              className={`title signup ${
                activeTab === "signup" ? "active" : ""
              }`}
              onClick={() => setActiveTab("signup")}
            >
              {/* Signup Form set up*/}
            </div>
          </div>
          <div className="form-container">
            <div className="slide-controls">
              <input
                type="radio"
                name="slide"
                id="login"
                checked={activeTab === "login"}
                onChange={() => setActiveTab("login")}
              />
              <input
                type="radio"
                name="slide"
                id="signup"
                checked={activeTab === "signup"}
                onChange={() => setActiveTab("signup")}
              />
              <label
                htmlFor="login"
                className={`slide login ${
                  activeTab === "login" ? "active" : ""
                }`}
              >
                Login
              </label>
              <label
                htmlFor="signup"
                className={`slide signup ${
                  activeTab === "signup" ? "active" : ""
                }`}
              >
                Signup
              </label>
              <div className="slider-tab"></div>
            </div>

            <div className="form-inner">
              {activeTab === "login" ? (
                <form onSubmit={handleLogin} className="login">
                  <div className="field">
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={loginDetails.username}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={loginDetails.password}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>
                  <div className="field btn">
                    <div className="btn-layer"></div>
                    <input type="submit" value="Login" />
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="signup">
                  <div className="field">
                    <input
                      type="text"
                      name="username"
                      placeholder="Username"
                      value={registerDetails.username}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <input
                      type="text"
                      name="name"
                      placeholder="Name"
                      value={registerDetails.name}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <input
                      type="text"
                      name="lastname"
                      placeholder="Lastname"
                      value={registerDetails.lastname}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <input
                      type="text"
                      name="email"
                      placeholder="Email"
                      value={registerDetails.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={registerDetails.password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>
                  <div className="field">
                    <select
                      name="role"
                      value={registerDetails.role}
                      onChange={handleRegisterChange}
                      required
                    >
                      <option value="User">User</option>
                      <option value="Superuser">Superuser</option>
                    </select>
                  </div>
                  <div className="field btn">
                    <div className="btn-layer"></div>
                    <input type="submit" value="Signup" />
                  </div>
                </form>
              )}
            </div>
            {errorMessage && <p className="error-message">{errorMessage}</p>}
          </div>
        </>
      ) : (
        <>
          {" "}
          {/* logic for displaying different tabs/buttons for the user to choose from*/}
          {/* <h1 className="content-heading">Product Management</h1>
          <div className="tabs">
            <button onClick={() => setActiveTab("all")}>All Products</button>
            <button onClick={() => setActiveTab("byId")}>Search by ID</button>
            <button onClick={() => setActiveTab("byCategory")}>Search by Category</button>
            <button onClick={() => setActiveTab("add")}>Add Product</button>
            <button onClick={() => setActiveTab("update")}>Update Product</button>
            <button onClick={() => setActiveTab("delete")}>Delete Product</button>
          </div> */}
          {errorMessage && <p className="error-message">{errorMessage}</p>}
          {/* logic for searching a product via the product id*/}
          <div className="content">
            {activeTab === "byId" && (
              <div>
                <input
                  type="number"
                  placeholder="Enter Product ID"
                  value={searchId}
                  onChange={(e) => setSearchId(e.target.value)}
                />
                <button onClick={fetchProductById}>Search</button>
              </div>
            )}
            {/* logic for searching a product via the product category*/}
            {activeTab === "byCategory" && (
              <div>
                <input
                  type="text"
                  placeholder="Enter Category Name"
                  value={searchCategory}
                  onChange={(e) => setSearchCategory(e.target.value)}
                />
                <button onClick={fetchProductsByCategory}>Search</button>
              </div>
            )}
            {/* logic to ensure the image URL is routed correctly so the images on local can show on the frontend*/}
            {["all", "byId", "byCategory"].includes(activeTab) && (
  <div className="products-list">
    {products.length === 0 ? (
      <p>No products found.</p>
    ) : (
      products.map((p) => {
        console.log("Product Image URL:", p.productImage); // This will log the image URL

        return (
          <div className="product" key={p.productId}>
            {p.productImage && (
              <img
                src={p.productImage} // Directly use the Cloudinary URL
                alt={p.productName}
                className="product-image"
              />
            )}
            <div className="product-info">
              <h3>{p.productName}</h3>
              <p>{p.productDescription}</p>
              <p>
                <strong>R{parseFloat(p.unitPrice).toFixed(2)}</strong> |{" "}
                {p.available} | Qty: {p.quantity}
              </p>
              <button
                className="add-to-cart-btn"
                onClick={() => handleAddToCart(p)}
              >
                Add to Cart 🛒
              </button>
            </div>
          </div>
        );
      })
    )}
  </div>
)}



            {/* logic for adding a product referencing the product form*/}
            {activeTab === "add" && (
  <form onSubmit={handleAddProduct} className="product-form">
    <input
      type="text"
      name="productName"
      placeholder="Name"
      value={productDetails.productName}
      onChange={handleProductInputChange}
      required
    />
    <input
      type="text"
      name="productDescription"
      placeholder="Description"
      value={productDetails.productDescription}
      onChange={handleProductInputChange}
      required
    />
    <input
      type="number"
      name="unitPrice"
      placeholder="Price"
      value={productDetails.unitPrice}
      onChange={handleProductInputChange}
      required
    />
    <input
      type="text"
      name="available"
      placeholder="Availability"
      value={productDetails.available}
      onChange={handleProductInputChange}
      required
    />
    <input
      type="number"
      name="quantity"
      placeholder="Quantity"
      value={productDetails.quantity}
      onChange={handleProductInputChange}
      required
    />
    <select
      name="categoryId"
      value={productDetails.categoryId}
      onChange={handleProductInputChange}
    >
      <option value="1">Category 1</option>
      <option value="2">Category 2</option>
      <option value="3">Category 3</option>
    </select>

    {productDetails.productImage === "yes" && (
      <input
        type="file"
        onChange={handleFileChange}
        accept="image/jpeg"
      />
    )}

    <select
      name="productImage"
      value={productDetails.productImage}
      onChange={handleProductInputChange}
      required
    >
      <option value="">Include Product Image?</option>
      <option value="yes">Yes</option>
      <option value="no">No</option>
    </select>

    <button type="submit">Add Product</button>
  </form>
)}

{activeTab === "update" && (
  <>
    <div>
      <input
        type="number"
        placeholder="Enter Product ID"
        value={searchId}
        onChange={(e) => setSearchId(e.target.value)}
      />
      <button
        onClick={async () => {
          try {
            const response = await axios.get(
              `http://localhost:5219/api/product/${searchId}`
            );
            const product = response.data;
            setProductDetails({
              productName: product.productName,
              productDescription: product.productDescription,
              unitPrice: product.unitPrice,
              available: product.available,
              quantity: product.quantity,
              categoryId: product.categoryId,
              productImage: "no", // Default state for update
              imageFile: null,
            });
          } catch (error) {
            setErrorMessage("Product not found.");
          }
        }}
      >
        Search
      </button>
    </div>

    <form onSubmit={handleUpdateProduct} className="product-form">
      <input
        type="text"
        name="productName"
        placeholder="Name"
        value={productDetails.productName}
        onChange={handleProductInputChange}
        required
      />
      <input
        type="text"
        name="productDescription"
        placeholder="Description"
        value={productDetails.productDescription}
        onChange={handleProductInputChange}
        required
      />
      <input
        type="number"
        name="unitPrice"
        placeholder="Price"
        value={productDetails.unitPrice}
        onChange={handleProductInputChange}
        required
      />
      <input
        type="text"
        name="available"
        placeholder="Availability"
        value={productDetails.available}
        onChange={handleProductInputChange}
        required
      />
      <input
        type="number"
        name="quantity"
        placeholder="Quantity"
        value={productDetails.quantity}
        onChange={handleProductInputChange}
        required
      />
      <select
        name="categoryId"
        value={productDetails.categoryId}
        onChange={handleProductInputChange}
      >
        <option value="1">Category 1</option>
        <option value="2">Category 2</option>
        <option value="3">Category 3</option>
      </select>

      <select
        name="productImage"
        value={productDetails.productImage}
        onChange={handleProductInputChange}
        required
      >
        <option value="">Include Product Image?</option>
        <option value="yes">Yes</option>
        <option value="no">No</option>
      </select>

      {productDetails.productImage === "yes" && (
        <input
          type="file"
          onChange={handleFileChange}
          accept="image/jpeg"
        />
      )}

      <button type="submit">Update Product</button>
    </form>
  </>
)}


            {activeTab === "delete" && (
              <div className="products-list">
                {products.length === 0 ? (
                  <p>No products found.</p>
                ) : (
                  products.map((product) => {
                    const baseUrl = "http://localhost:5219";
                    const cleanImagePath =
                      product.productImage
                        ?.replace(/\\/g, "/")
                        .replace("/images/", "") || "";
                    const imageUrl = cleanImagePath.startsWith("http")
                      ? cleanImagePath
                      : `${baseUrl}/${cleanImagePath.replace(
                          /^wwwroot\//,
                          ""
                        )}`;

                    return (
                      <div key={product.productId} className="product">
                        <h4>{product.productName}</h4>
                        {product.productImage && (
                          <img src={imageUrl} alt="Product" />
                        )}
                        <button
                          onClick={() =>
                            handleDeleteProduct(
                              product.productId,
                              product.productName
                            )
                          }
                        >
                          Delete
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default App;
