import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"; // <-- Import useNavigate
import "./LoginSignup.css";
import Sidebar from "./components/SideBar";
import LogoutButton from "./components/LogoutButton";
import Wallet from "./components/Wallet";
import ManageProducts from "./components/ManageProducts";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userDetails, setUserDetails] = useState({ role: "" });
  const [activeTab, setActiveTab] = useState("login");
  const [products, setProducts] = useState([]);
  const [dashboardTab, setDashboardTab] = useState("landing");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCart, setShowCart] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);



  


  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const loadBalance = async () => {
      if (user?.userId) {
        const balance = await fetchWalletBalance(user.userId);
        setWalletBalance(balance);
      }
    };
    loadBalance();
  }, [user]);

  const fetchWalletBalance = async (userId) => {
    try {
      const response = await fetch(
        `http://localhost:5219/api/wallet/${userId}`
      );
      if (!response.ok) throw new Error("Wallet not found.");
      const data = await response.json();
      return data.balance ?? 0;
    } catch (error) {
      console.error("Failed to fetch wallet balance:", error);
      return 0;
    }
  };

  // const toggleCart = () => {
  //   setShowCart((prev) => !prev);
  // };

  // const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 3;

  // Calculate indexes
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = products.slice(
    indexOfFirstProduct,
    indexOfLastProduct
  );

  // Total pages
  const totalPages = Math.ceil(products.length / productsPerPage);

  const centerTabs = [
    "landing",
    "add",
    "byCategory",
    "update",
    "wallet",
    "manageproducts",
  ];

  const backgroundStyle = {
    backgroundImage: "url(/images/background_image.jpg)",
    backgroundSize: "cover",
    backgroundPosition: "center",
    backgroundAttachment: "fixed",
    minHeight: "100vh",
    width: "100vw",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: centerTabs.includes(dashboardTab || activeTab)
      ? "center"
      : "flex-start",
  };

  let cartItems = {}; // Key: productId, Value: { product, quantity }

  function handleAddToCart(product) {
    const id = product.productId;

    if (cartItems[id]) {
      cartItems[id].quantity += 1;
      updateCartUI();
      alert(`Added "${product.productName}" to cart!`);
    } else if (product.available == "no") {
      alert(`${product.productName} is currently unavailable.`);
      updateCartUI();
      alert(`Cannot add "${product.productName}" to cart!`);
    } else {
      cartItems[id] = { product, quantity: 1 };
      updateCartUI();
      alert(`Added "${product.productName}" to cart!`);
    }
  }

  function updateCartUI() {
    const cartList = document.querySelector(".cart-list");

    const totalPriceElement = document.getElementById("total-price");

    if (!cartList || !totalPriceElement) return;

    cartList.innerHTML = ""; // Clear previous items
    let totalPrice = 0;
    let totalItemCount = 0;

    Object.values(cartItems).forEach(({ product, quantity }) => {
      const li = document.createElement("li");
      li.className = "cart-item";

      const unitPrice = product.unitPrice || 0;
      const subtotal = unitPrice * quantity;
      totalPrice += subtotal;
      totalItemCount += quantity;

      li.innerHTML = `
      <div class="cart-image-wrapper">
        <img src="${product.productImage || ""}" alt="${
        product.productName
      }" class="cart-product-image" />
        <span class="quantity-badge">${quantity}</span>
      </div>
    
      <div class="cart-product-details">
        <span class="cart-product-name">${product.productName}</span>
        <span class="cart-product-price">R${unitPrice.toFixed(2)}</span>
        <div class="cart-quantity-controls">
          <button class="decrease-btn" data-id="${product.productId}">−</button>
          <span class="quantity">${quantity}</span>
          <button class="increase-btn" data-id="${product.productId}" ${
        quantity >= product.stock ? "disabled" : ""
      }>+</button>
        </div>
        <button class="remove-item-btn" data-id="${
          product.productId
        }">Remove</button>
      </div>
    `;

      cartList.appendChild(li);
    });

    totalPriceElement.textContent = `R${totalPrice.toFixed(2)}`;
    const cartCountElement = document.querySelector(".cart-count");
    if (cartCountElement) cartCountElement.textContent = totalItemCount;

    // Bind "+" and "−" buttons
    cartList.querySelectorAll(".increase-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        changeItemQuantity(btn.dataset.id, 1)
      );
    });
    cartList.querySelectorAll(".decrease-btn").forEach((btn) => {
      btn.addEventListener("click", () =>
        changeItemQuantity(btn.dataset.id, -1)
      );
    });
    cartList.querySelectorAll(".remove-item-btn").forEach((btn) => {
      btn.addEventListener("click", () => removeItemFromCart(btn.dataset.id));
    });
  }

  async function changeItemQuantity(productId, delta) {
    const item = cartItems[productId];
    if (!item) return;

    const currentQty = item.quantity;
    const newQty = currentQty + delta;

    // Fetch product data from the server to get the available quantity
    try {
      const response = await fetch(
        `http://localhost:5219/api/product/${productId}`
      );

      // Check if the response is ok (status 200-299)
      if (!response.ok) {
        throw new Error(`Failed to fetch product data: ${response.statusText}`);
      }

      // Parse the response JSON to get the product data
      const productData = await response.json();

      const availableQuantity = productData.quantity; // This is now 'quantity', not 'stock'
      const productName = productData.productName;

      // Limit the quantity based on available quantity (from the database)
      if (newQty <= 0) {
        if (
          window.confirm(`Remove "${item.product.productName}" from the cart?`)
        ) {
          delete cartItems[productId];
        }
      } else if (productData.available == "no") {
        alert(`${productName} is currently unavailable.`);
      } else if (newQty > availableQuantity) {
        alert(
          `Only ${availableQuantity} of ${productName} available in stock.`
        );
      } else {
        item.quantity = newQty;
      }

      updateCartUI();
    } catch (err) {
      console.error("Failed to fetch product quantity:", err);
      alert("Unable to verify product quantity. Please try again.");
    }
  }

  function removeItemFromCart(productId) {
    const item = cartItems[productId];
    if (!item) return;

    if (
      window.confirm(
        `Are you sure you want to remove "${item.product.productName}" from the cart?`
      )
    ) {
      delete cartItems[productId];
      updateCartUI();
    }
  }

  function toggleCart() {
    const cartBox = document.getElementById("cart-items");
    cartBox?.classList.toggle("hidden");
  }

  function handleCheckout() {
    const delivery = prompt(
      "How would you like to receive your order? (A = Pickup, B = Delivery)"
    );
    const deliveryMethod =
      delivery?.toUpperCase() === "A" ? "Pickup" : "Delivery";

    fetch("/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ deliveryMethod }),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.message) {
          alert(res.message);
          cartItems = {};
          updateCartUI();
        } else {
          alert("Error during checkout.");
        }
      })
      .catch((err) => {
        console.error("Checkout error", err);
        alert("Failed to complete checkout.");
      });
  }

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
  // const [searchQuery, setSearchQuery] = useState("");

  // const handleSearchChange = (query) => {
  //   setSearchQuery(query);
  //   filterProducts(query);
  // };

  // const filterProducts = (query) => {
  //   const lowerCaseQuery = query.toLowerCase();

  //   const filtered = allProducts.filter((product) =>
  //     product.name.toLowerCase().includes(lowerCaseQuery)
  //   );

  //   setDisplayedProducts(filtered);
  // };

  const [searchId, setSearchId] = useState("");
  const [searchCategory, setSearchCategory] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [categories, setCategories] = useState([]);

  const fetchCategories = async () => {
    try {
      const res = await axios.get("http://localhost:5219/api/productcategory");

      // Ensure it's an array
      if (Array.isArray(res.data)) {
        setCategories(res.data); // categories will now be an array of objects
      } else {
        console.error("Expected an array but got:", res.data);
      }
    } catch (err) {
      console.error("Error fetching categories", err);
    }
  };
  const categoryMap = categories.reduce((map, cat) => {
    map[cat.categoryId] = cat.categoryName;
    return map;
  }, {});

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
  localStorage.clear();
  setIsLoggedIn(false);
  setToken(null);

  // Clear login and register form inputs
  setLoginDetails({ username: "", password: "" });
  setRegisterDetails({ username: "", email: "", password: "", confirmPassword: "" });

  // Redirect to login page
  navigate("/login");
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
      setActiveTab("all");
    }
  }, [isLoggedIn]);

  const fetchAllProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5219/api/product");
      setProducts(response.data);
    } catch (error) {
      handleError(error);
    }
  };
  const fetchActiveProducts = async () => {
    try {
      const response = await axios.get(
        "http://localhost:5219/api/product/activeProducts"
      );
      setProducts(response.data);
    } catch (error) {
      handleError(error);
    }
  };
  
  const fetchActiveProductsByCategory = async (categoryName) => {
    const category = categoryName || searchCategory;

    if (!category.trim()) {
      setErrorMessage("Category name is required.");
      setProducts([]);
      return;
    }

    try {
      // Fetch all active products
      const response = await axios.get(
        "http://localhost:5219/api/product/activeProducts"
      );

      // Ensure you have category mappings loaded
      if (categories.length === 0) {
        // Optional: You could fetch categories here if not already available
        setErrorMessage("Category data is missing.");
        return;
      }

      // Find the matching category ID
      const matchedCategory = categories.find(
        (c) => c.categoryName.toLowerCase() === category.toLowerCase()
      );

      if (!matchedCategory) {
        setErrorMessage("Category not found.");
        setProducts([]);
        return;
      }

      const filtered = response.data.filter(
        (product) => product.categoryId === matchedCategory.categoryId
      );

      if (filtered.length === 0) {
        setErrorMessage("No active products found for that category.");
        setProducts([]);
      } else {
        setProducts(filtered);
        setErrorMessage("");
      }
    } catch (error) {
      console.error("Error fetching active products by category:", error);
      setErrorMessage("Error fetching products.");
      setProducts([]);
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
  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://localhost:5219/api/product");
      setProducts(response.data);
      setErrorMessage("");
    } catch (error) {
      setErrorMessage("Error fetching all products.");
      setProducts([]);
    }
  };

  const fetchProductsByCategory = async (categoryName) => {
    const category = categoryName || searchCategory;
    if (!category.trim()) {
      return setErrorMessage("Category name is required.");
    }

    try {
      const response = await axios.get(
        `http://localhost:5219/api/product/byCategory?name=${category}`
      );
      if (response.data.length === 0) {
        setErrorMessage("No products found for that category.");
        setProducts([]);
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
  const [uploading, setUploading] = useState(false); // Add this state to track upload progress

  const handleFileChange = async (e) => {
    const file = e.target.files[0]; // Get the file from the input
    if (file && (file.type === "image/jpeg" || file.type === "image/jpg")) {
      // Allow both jpeg and jpg
      try {
        setUploading(true); // Set uploading state
        const formData = new FormData();
        formData.append("file", file); // Use the selected file
        formData.append("upload_preset", "unsigned_preset");
        formData.append("folder", "samples/ecommerce");

        // Upload the image to Cloudinary
        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/djmafre5k/image/upload",
          formData
        );

        // Get the Cloudinary URL
        const imageUrl = response.data.secure_url;
        setProductDetails((prev) => ({ ...prev, imageFile: imageUrl }));
        setUploading(false); // Set uploading state to false once done
      } catch (error) {
        console.error("Error uploading image to Cloudinary:", error);
        setErrorMessage("Error uploading image.");
        setUploading(false); // Reset uploading state
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
      imageFile, // This should now be a Cloudinary URL string
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
      categoryId <= 0 ||
      !imageFile // must have the uploaded image URL
    ) {
      setErrorMessage("Please fill all fields correctly, including image.");
      return;
    }

    console.log("ImageFile (Cloudinary URL):", imageFile);

    const formData = new FormData();
    formData.append("productName", productName);
    formData.append("productDescription", productDescription);
    formData.append("unitPrice", unitPrice);
    formData.append("available", available);
    formData.append("quantity", quantity);
    formData.append("categoryId", categoryId);
    formData.append("productImage", productDetails.imageFile); // this should be the Cloudinary URL
    console.log("FormData before submitting:", formData);

    try {
      const res = await axios.post(
        "http://localhost:5219/api/product/addProduct",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log("Product added:", res.data);
      alert("Product added successfully!");
      clearForm();
    } catch (err) {
      console.error("Add product error:", err.response?.data || err.message);
      setErrorMessage("Failed to add product.");
    }
  };

  // const handleUpdateProduct = async (productId) => {
  //   if (!productId || isNaN(productId)) {
  //     setErrorMessage("Please enter a valid Product ID.");
  //     return;
  //   }

  //   const {
  //     productName,
  //     productDescription,
  //     unitPrice,
  //     available,
  //     quantity,
  //     categoryId,
  //     imageFile, // This should already be a Cloudinary URL
  //   } = productDetails;

  //   if (
  //     !productName ||
  //     !productDescription ||
  //     isNaN(unitPrice) ||
  //     unitPrice <= 0 ||
  //     !available ||
  //     isNaN(quantity) ||
  //     quantity < 0 ||
  //     isNaN(categoryId) ||
  //     categoryId <= 0 ||
  //     !imageFile
  //   ) {
  //     setErrorMessage("Please fill all fields correctly, including image.");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("productName", productName);
  //   formData.append("productDescription", productDescription);
  //   formData.append("unitPrice", unitPrice);
  //   formData.append("available", available);
  //   formData.append("quantity", quantity);
  //   formData.append("categoryId", categoryId);
  //   formData.append("productImage", imageFile);

  //   try {
  //     const res = await axios.put(
  //       `http://localhost:5219/api/product/${productId}`,
  //       formData,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "multipart/form-data",
  //         },
  //       }
  //     );
  //     console.log("Product updated:", res.data);
  //     alert("Product updated successfully!");
  //     clearForm();
  //   } catch (err) {
  //     console.error("Update product error:", err.response?.data || err.message);
  //     setErrorMessage("Failed to update product.");
  //   }
  // };

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

      console.log(response.data); // Debug: confirm full data is received

      if (response.data && response.data.token && response.data.user) {
        setToken(response.data.token);
        setIsLoggedIn(true);

        // ✅ Store both token and user object
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        alert("Login successful");
        setDashboardTab("all"); // Navigate to the landing/dashboard page
      } else {
        setErrorMessage("Login failed: Incomplete response.");
      }
    } catch (error) {
      console.error("Login error: ", error);
      const errorMessage =
        error.response?.data?.message || "An error occurred during login.";
      setErrorMessage(errorMessage);
      setLoginDetails({ username: "", password: "" });
    }
  };

  {
    /* logic for handling registration and redirecting to the login page when registration is successful*/
  }
  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting registration details:", registerDetails);

      await axios.post(
        "http://localhost:5219/api/user/register",
        registerDetails
      );

      alert("Registration successful!");
      setActiveTab("login"); // Switch to login tab on successful registration
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );

      setErrorMessage("Error registering.");
      setRegisterDetails({
        username: "",
        firstName: "",
        lastName: "",
        password: "",
        email: "",
        role: "",
      });
    }
  };
  useEffect(() => {
    if (activeTab === "manageproducts") {
      fetchCategories(); // <-- Fetch only when needed
      fetchProducts(); // <-- Optional: also re-fetch products if needed
    }
  }, [activeTab]);
  {
    /* logic to clear any output when the user chooses a different page/tab as well as ensuring for search that no products show until the search input has been returned*/
  }
  useEffect(() => {
    clearForm();

    if (["all", "delete"].includes(activeTab)) {
      fetchActiveProducts();
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
    <div style={backgroundStyle}>
      <div className="wrapper">
        {/* Show Sidebar and LogoutButton ONLY when logged in */}
        {isLoggedIn && (
          <>
            <Sidebar
              isLoggedIn={token !== null} // Pass logged-in status
              userRole={userDetails.role} // Pass user role
              onMenuClick={handleMenuClick} // Handle menu item click
              isOpen={isSidebarOpen} // Pass down isSidebarOpen to control sidebar visibility
              setIsOpen={setIsSidebarOpen} // Pass setIsOpen to Sidebar to control the sidebar open/close state
            />
            {/* <Routes>
          <Route
            path="/manageproducts"
            element={<ManageProducts />}  // Directly render ManageProducts here
          />
        </Routes> */}

            <div class="cart-container">
              <button className="cart-button wallet-button">
                💰 R{walletBalance.toFixed(2)}
              </button>

              <button className="cart-button" onClick={toggleCart}>
                🛒 <span class="cart-count">0</span>
              </button>
            </div>

            <div id="cart-items" className="cart-items hidden">
              <h3>Your Cart</h3>
              <ul class="cart-list"></ul>
              <div class="cart-footer">
                <button class="checkout-btn" onClick={handleCheckout}>
                  Checkout
                </button>
                <span id="total-price">R0.00</span>
              </div>
            </div>

            {showCart && (
              <div id="cart-items" className="cart-items">
                <h3>Your Cart</h3>
                <ul className="cart-list">
                  {cartItems.map((item, idx) => (
                    <li key={idx}>{item.productName}</li>
                  ))}
                </ul>
              </div>
            )}

            <LogoutButton onLogout={handleLogout} />

            {dashboardTab === "wallet" && <Wallet />}
            {dashboardTab === "manageproducts" && <ManageProducts />}
          </>
        )}
        {!isLoggedIn ? (
          <>
            <div className="title-text">
              <div
                className={`title login ${
                  activeTab === "login" ? "active" : ""
                }`}
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
                        name="firstName"
                        placeholder="First Name"
                        value={registerDetails.firstName}
                        onChange={handleRegisterChange}
                        required
                      />
                    </div>
                    <div className="field">
                      <input
                        type="text"
                        name="lastName"
                        placeholder="Last Name"
                        value={registerDetails.lastName}
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
                        <option value="">Select Role</option>
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
              {/* Search by category name (manual input) */}
              {activeTab === "byCategory" && (
                <div>
                  <input
                    type="text"
                    placeholder="Enter Category Name"
                    value={searchCategory}
                    onChange={(e) => setSearchCategory(e.target.value)}
                  />
                  <button
                    onClick={() =>
                      fetchActiveProductsByCategory(searchCategory)
                    }
                  >
                    Search
                  </button>
                </div>
              )}

              {/* Display product table if a relevant tab is active */}
              {["all", "byId", "byCategory"].includes(activeTab) && (
                <>
                  {/* Category Buttons visible in "all" tab */}
                  {activeTab === "all" && (
                    <div className="category-toolbar">
                      <div className="category-buttons">
                        <button onClick={fetchActiveProducts}>All</button>
                        {categories.map((cat) => (
                          <button
                            key={cat.categoryId}
                            onClick={() =>
                              fetchActiveProductsByCategory(cat.categoryName)
                            }
                          >
                            {cat.categoryName}
                          </button>
                        ))}
                      </div>
                      {/* <input
                type="text"
                className="category-search"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
              /> */}
                    </div>
                  )}

                  <div className="products-list">
                    {products.length === 0 ? (
                      <p>No products found.</p>
                    ) : (
                      products.map((p) => (
                        <div className="product" key={p.productId}>
                          {p.productImage && (
                            <img
                              src={p.productImage}
                              alt={p.productName}
                              className="product-image"
                            />
                          )}
                          <div className="product-info">
                            <h3>{p.productName}</h3>
                            <p>{p.productDescription}</p>
                            <p>
                              <strong>
                                R{parseFloat(p.unitPrice).toFixed(2)}
                              </strong>{" "}
                              | Qty: {p.quantity} |
                            </p>
                            <button
                              className="add-to-cart-btn"
                              onClick={() => handleAddToCart(p)}
                            >
                              Add to Cart 🛒
                            </button>
                          </div>
                        </div>
                        
                      ))
                      
                    )}
                
                  </div>
                </>
              )}
              {/*Logic for product management tab/layout*/}
              {/* {activeTab === "manage" && (
                <div className="product-table-container">
                  <h2>All Products</h2>

                  {errorMessage && (
                    <p style={{ color: "red" }}>{errorMessage}</p>
                  )}

                  <div className="table-wrapper">
                    <table className="product-table">
                      <thead>
                        <tr>
                          <th>Name</th>

                          <th>Category</th>
                          <th>Description</th>
                          <th>Image URL</th>
                          <th>Available</th>
                          <th>Price</th>
                          <th>Quantity</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {currentProducts.map((product) => (
                          <tr key={product.productId}>
                            <td>{product.productName}</td>

                            <td>
                              {categoryMap[product.categoryId] || "Unknown"}
                            </td>
                            <td>{product.productDescription}</td>
                            <td>{product.productImage}</td>
                            <td>{product.available}</td>
                            <td>{product.unitPrice}</td>
                            <td>{product.quantity}</td>
                            <td>
                              <button
                                onClick={() =>
                                  handleUpdateProduct(product.productId)
                                }
                              >
                                Update
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div> */}

              {/* Pagination Controls */}
              {/* <div className="pagination">
                    <button
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(prev - 1, 1))
                      }
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
                </div>
              )} */}

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

                  {/* <form onSubmit={handleUpdateProduct} className="product-form">
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
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.categoryName}
                        </option>
                      ))}
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
                  </form> */}
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
    </div>
  );
};

export default App;
