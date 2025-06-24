import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./LoginSignup.css";
import Sidebar from "./components/SideBar";
import LogoutButton from "./components/LogoutButton";
import Wallet from "./components/Wallet";
import ManageProducts from "./components/ManageProducts";
import Transactions from "./components/Transactions";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import ManageUsers from "./components/ManageUsers";

const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [userDetails, setUserDetails] = useState({ role: "" });
  const [activeTab, setActiveTab] = useState("login");
  const [products, setProducts] = useState([]);
  const [dashboardTab, setDashboardTab] = useState("landing");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showCart] = useState(false);
  const [walletBalance, setWalletBalance] = useState(0);
  const [cartItems] = useState({});
  const lastSelectedCategoryRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [alertMessage, setAlertMessage] = useState("");
  //eslint-disable-next-line
  const [showLoginForm, setShowLoginForm] = useState(true);


  const [alertType, setAlertType] = useState(""); // 'success' or 'error'

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
  useEffect(() => {
    console.log("cartItems changed", cartItems);
  }, [cartItems]);

  useEffect(() => {
    console.log("products changed", products);
  }, [products]);

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

  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 8;

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

  let deliveryOption = "pickup"; // default pickup
  const DELIVERY_FEE = 15.0;

  async function handleAddToCart(product) {
    const id = product.productId;

    try {
      const response = await fetch(`http://localhost:5219/api/product/${id}`);
      if (!response.ok) throw new Error("Failed to fetch product data.");
      const latestProduct = await response.json();

      if (latestProduct.available === "no" || latestProduct.quantity <= 0) {
        toast.error(`${latestProduct.productName} is out of stock.`);
        return;
      }

      // Reserve one unit
      await fetch(`http://localhost:5219/api/product/reserve/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1 }),
      });

      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.userId) throw new Error("User not logged in.");

      let cartId;
      const cartRes = await fetch(
        `http://localhost:5219/api/cart/active/${user.userId}`
      );
      if (cartRes.ok) {
        const existingCart = await cartRes.json();
        cartId = existingCart.cartId;
      } else {
        const createRes = await fetch(`http://localhost:5219/api/cart/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.userId }),
        });
        const newCart = await createRes.json();
        cartId = newCart.cartId;
      }

      const addRes = await fetch(`http://localhost:5219/api/cart/addProduct`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId,
          productId: id,
          quantity: 1,
          product: latestProduct,
        }),
      });

      const added = await addRes.json();

      if (!cartItems[id]) {
        cartItems[id] = {
          product: latestProduct,
          quantity: 1,
          cartId,
          productId: id,
          cartProductId: added.cartProductId,
        };
      } else {
        cartItems[id].quantity += 1;
      }

      setProducts((prev) =>
        prev.map((p) =>
          p.productId === id ? { ...p, quantity: p.quantity - 1 } : p
        )
      );

      updateCartUI();
      toast.success(`Added "${latestProduct.productName}" to cart.`);
    } catch (err) {
      console.error("Add to cart error:", err);
      toast.error(err.message || "Error adding to cart.");
    }
  }

  function updateCartUI() {
    const cartList = document.querySelector(".cart-list");
    const totalPriceElement = document.getElementById("total-price");
    let cartFooter = document.querySelector(".cart-footer");

    if (!cartList || !totalPriceElement) return;

    cartList.innerHTML = "";
    let totalPrice = 0;
    let totalItemCount = 0;

    Object.entries(cartItems).forEach(([productId, { product, quantity }]) => {
      const unitPrice = product.unitPrice || 0;
      const subtotal = unitPrice * quantity;
      totalPrice += subtotal;
      totalItemCount += quantity;

      const li = document.createElement("li");
      li.className = "cart-item";

      li.innerHTML = `
        <div class="cart-item-layout" style="display: flex; align-items: flex-start; gap: 12px;">
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
              <button class="decrease-btn" data-id="${productId}">−</button>
              <span class="quantity">${quantity}</span>
              <button class="increase-btn" data-id="${productId}" ${
        quantity >= product.quantity ? "disabled" : ""
      }>+</button>
            </div>
            <button class="remove-item-btn" data-id="${productId}">Remove</button>
          </div>
        </div>
      `;

      cartList.appendChild(li);
    });

    // Update footer content directly
    if (cartFooter) {
      cartFooter.innerHTML = `
        <div class="footer-left" style="display: flex; flex-direction: column; gap: 10px;">
          <div class="delivery-options" style="display: flex; flex-direction: column; gap: 5px;">
            <label style="font-size: 0.85rem;">
              <input type="radio" name="deliveryOption" value="pickup" ${
                deliveryOption === "pickup" ? "checked" : ""
              } />
              Pickup (R0.00)
            </label>
            <label style="font-size: 0.85rem;">
              <input type="radio" name="deliveryOption" value="delivery" ${
                deliveryOption === "delivery" ? "checked" : ""
              } />
              Delivery (R15.00)
            </label>
          </div>
          <div class="checkout-row" style="display: flex; justify-content: space-between; align-items: center; gap: 20px;">
            <button class="checkout-btn">Checkout</button>
            <div class="cart-total" style="margin: 0; font-weight: bold; color: #7f35b3;">
              Total: <span id="total-price">R0.00</span>
            </div>
          </div>
        </div>
      `;

      const checkoutBtn = cartFooter.querySelector(".checkout-btn");
      if (checkoutBtn) {
        checkoutBtn.addEventListener("click", handleCheckout);
      }

      cartFooter
        .querySelectorAll('input[name="deliveryOption"]')
        .forEach((radio) => {
          radio.addEventListener("change", (e) => {
            deliveryOption = e.target.value;
            updateCartUI(); // Refresh total
          });
        });
    }

    if (deliveryOption === "delivery") {
      totalPrice += DELIVERY_FEE;
    }

    const newTotalEl = cartFooter.querySelector("#total-price");
    if (newTotalEl) {
      newTotalEl.textContent = `R${totalPrice.toFixed(2)}`;
    }

    const cartCountElement = document.querySelector(".cart-count");
    if (cartCountElement) cartCountElement.textContent = totalItemCount;

    if (!cartList.hasEventListener) {
      cartList.addEventListener("click", (event) => {
        const btn = event.target;
        const id = btn.dataset.id;
        if (!id) return;

        if (btn.classList.contains("increase-btn")) {
          changeItemQuantity(id, "increase");
        }
        if (btn.classList.contains("decrease-btn")) {
          changeItemQuantity(id, "decrease");
        }
        if (btn.classList.contains("remove-item-btn")) {
          removeItemFromCart(id);
        }
      });

      cartList.hasEventListener = true;
    }
  }

  const quantityProcessing = {};

  async function changeItemQuantity(productId, action) {
    if (quantityProcessing[productId]) return;
    quantityProcessing[productId] = true;

    const item = cartItems[productId];
    if (!item) {
      quantityProcessing[productId] = false;
      return;
    }

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user?.userId) {
      quantityProcessing[productId] = false;
      throw new Error("User not logged in.");
    }

    try {
      // Fetch latest product data
      const productRes = await fetch(
        `http://localhost:5219/api/product/${productId}`
      );
      if (!productRes.ok) throw new Error("Failed to fetch product.");
      const productData = await productRes.json();

      let newQuantity = item.quantity;

      if (action === "increase") {
        if (productData.quantity <= 0) {
          toast.error(`"${productData.productName}" is out of stock.`);

          return;
        }

        newQuantity = item.quantity + 1;
      } else if (action === "decrease") {
        newQuantity = item.quantity - 1;

        if (newQuantity <= 0) {
          await removeItemFromCart(productId);
          return;
        }
      }

      // Update cart using PUT with the final new quantity
      await fetch(`http://localhost:5219/api/cart/update-product-quantity`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.userId,
          productId,
          quantity: newQuantity,
        }),
      });

      // Update local cart
      item.quantity = newQuantity;
      updateCartUI();

      // Refresh stock
      const updatedProductRes = await fetch(
        `http://localhost:5219/api/product/${productId}`
      );
      const updatedProduct = await updatedProductRes.json();

      setProducts((prev) =>
        prev.map((p) =>
          p.productId === productId
            ? { ...p, quantity: updatedProduct.quantity }
            : p
        )
      );

      updateCartUI();
    } catch (err) {
      console.error("Quantity change error:", err);
      alert(err.message || "Error updating cart.");
    } finally {
      quantityProcessing[productId] = false;
    }
  }

  async function removeItemFromCart(productId) {
    const item = cartItems[productId];
    if (!item) return;

    const confirmRemove = window.confirm(
      `Remove "${item.product.productName}" from cart?`
    );
    if (!confirmRemove) return;

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.userId) throw new Error("No user found");

      await fetch(`http://localhost:5219/api/cart/remove-product`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cartId: item.cartId,
          productId: item.productId,
        }),
      });

      await fetch(
        `http://localhost:5219/api/product/release/${item.productId}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ quantity: item.quantity }),
        }
      );

      delete cartItems[productId];

      setProducts((prev) =>
        prev.map((p) =>
          p.productId === item.productId
            ? { ...p, quantity: p.quantity + item.quantity }
            : p
        )
      );

      updateCartUI();
    } catch (err) {
      console.error("Remove error:", err);
      alert("Failed to remove item.");
    }
  }

  // Toggle cart display
  function toggleCart() {
    const cartBox = document.getElementById("cart-items");
    cartBox?.classList.toggle("hidden");
  }

  // Updated handleCheckout to receive delivery option from global state
  async function handleCheckout() {
    // Use global deliveryOption variable instead of prompt
    const deliveryMethod = deliveryOption === "pickup" ? "Pickup" : "Delivery";

    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.userId) return alert("User not logged in.");

    let wallet;
    try {
      const res = await fetch(
        `http://localhost:5219/api/wallet/${user.userId}`
      );
      if (!res.ok) throw new Error("Failed to fetch wallet.");
      wallet = await res.json();
    } catch (err) {
      console.error("Wallet error:", err);
      return alert("Failed to fetch wallet.");
    }

    if (!wallet || wallet.balance == null) return alert("Wallet not found.");

    let total = 0;
    for (const item of Object.values(cartItems)) {
      total += item.product.unitPrice * item.quantity;
    }

    if (deliveryMethod === "Delivery") {
      total += DELIVERY_FEE;
    }

    if (wallet.balance < total) {
      return alert("Insufficient funds in your wallet.");
    }

    try {
      const checkoutPayload = {
        userId: user.userId,
        deliveryMethod,
      };

      const res = await fetch(
        "http://localhost:5219/api/transaction/checkout",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(checkoutPayload),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || "Checkout failed.");
      }

      const result = await res.json();
      alert(result.message || "Checkout successful!");
      for (const key in cartItems) {
        delete cartItems[key];
      }
      localStorage.removeItem("cartItems");
      updateCartUI();
    } catch (err) {
      console.error("Checkout failed:", err);
      alert(err.message || "Failed to complete checkout.");
    }
  }
  // eslint-disable-next-line
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
  // // eslint-disable-next-line
  // const categoryMap = categories.reduce((map, cat) => {
  //   map[cat.categoryId] = cat.categoryName;
  //   return map;
  // }, {});

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
  // eslint-disable-next-line
  const [searchPerformed, setSearchPerformed] = useState(false); // Flag to track if search was performed

  const navigate = useNavigate(); // <-- Initialize the navigate function

  const handleLogout = () => {
    localStorage.clear();
    setIsLoggedIn(false);
    setToken(null);

    // Clear login and register form inputs
    setLoginDetails({ username: "", password: "" });
    setRegisterDetails({
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    });

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
      toast.error("Category name is required.");
      setProducts([]);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:5219/api/product/activeProducts"
      );

      if (!categories || categories.length === 0) {
        toast.error("Category data is missing.");
        return;
      }

      const matchedCategory = categories.find(
        (c) => c.categoryName.toLowerCase() === category.toLowerCase()
      );

      if (!matchedCategory) {
        toast.error("Category not found.");
        setProducts([]);
        return;
      }

      const filtered = response.data.filter(
        (product) => product.categoryId === matchedCategory.categoryId
      );

      setProducts(filtered); // Always update state, even if empty

      if (filtered.length === 0) {
        // Force the toast to show by dismissing previous and showing a new one
        toast.dismiss("no-products");
        toast.info(
          `No active products found in '${matchedCategory.categoryName}'.`,
          {
            toastId: `no-products-${Date.now()}`, // make toastId unique
          }
        );
      }
    } catch (error) {
      console.error("Error fetching active products by category:", error);
      toast.error("Error fetching products.");
      setProducts([]);
    }
  };
  const fetchActiveProductsByName = async (productName) => {
    const name = productName || searchTerm;

    if (!name.trim()) {
      toast.error("Product name is required.");
      setProducts([]);
      return;
    }

    try {
      const response = await axios.get(
        "http://localhost:5219/api/product/activeProducts"
      );

      if (!response.data || response.data.length === 0) {
        toast.error("No product data found.");
        setProducts([]);
        return;
      }

      const filtered = response.data.filter((product) =>
        product.productName?.toLowerCase().includes(name.toLowerCase())
      );

      setProducts(filtered); // Always update state, even if empty

      if (filtered.length === 0) {
        toast.dismiss("no-products");
        toast.info(`No active products found matching '${name}'.`, {
          toastId: `no-products-${Date.now()}`,
        });
      }
    } catch (error) {
      console.error("Error fetching active products by name:", error);
      toast.error("Error fetching products.");
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

  /* logic for handling server errors so user knows what the problem is*/

  const handleError = (error) => {
    toast.dismiss("main-error");

    if (error.response?.status === 401) {
      toast.error("Unauthorized. Please log in.", { toastId: "main-error" });
    } else if (error.response?.status === 404) {
      toast.error("Not found.", { toastId: "main-error" });
    } else if (error.response?.status === 403) {
      toast.error("You are not authorized to perform this action.", {
        toastId: "main-error",
      });
    } else {
      toast.error("An unexpected error occurred.", { toastId: "main-error" });
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

  /* logic for handling the login and receiving & saving the user token for authorization*/

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(
        "http://localhost:5219/api/user/login",
        loginDetails
      );

      console.log(response.data);

      if (response.data && response.data.token && response.data.user) {
        setToken(response.data.token);
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
      
        setAlertMessage("Login successful!");
        setAlertType("success");
      
        // Show alert but keep login form visible
        setShowLoginForm(true);
      
        setTimeout(() => {
          setAlertMessage("");
          setShowLoginForm(false);   // Hide login form after alert
          setIsLoggedIn(true);       // User is now logged in
          setDashboardTab("all");    // Show dashboard tab
        }, 500);
      }
       else {
        setAlertMessage("Login failed: Incomplete response.");
        setAlertType("error");
      }
    } catch (error) {
      console.error("Login error:", error);
      let errorMessage = "An error occurred during login.";

      if (error.response) {
        const status = error.response.status;
        const serverMessage = error.response.data?.message;

        if (status === 400) {
          errorMessage = "Fields missing. Please try again.";
        } else if (status === 401) {
          errorMessage = "Incorrect username or password.";
        } else if (status === 500) {
          errorMessage = "Server error. Please try again later.";
        } else {
          errorMessage = serverMessage || errorMessage;
        }
      }

      setAlertMessage(errorMessage);
      setAlertType("error");
      setLoginDetails({ username: "", password: "" });

      setTimeout(() => {
        setAlertMessage(""); // Auto-dismiss
      }, 3000);
    }
  };

  /* logic for handling registration and redirecting to the login page when registration is successful*/

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      console.log("Submitting registration details:", registerDetails);
  
      // Force role to 'User' for default role on registration
      const dataToSend = { ...registerDetails, role: "User" };
  
      await axios.post(
        "http://localhost:5219/api/user/register",
        dataToSend
      );
  
      setAlertMessage("Registration successful!");
      setAlertType("success");
  
      setTimeout(() => {
        setAlertMessage("");
        setActiveTab("login");
      }, 2500);
    } catch (error) {
      console.error(
        "Registration error:",
        error.response?.data || error.message
      );
  
      // Extract specific error message if available
      const errorMsg =
        error.response?.data?.message || // If your API sends a message field
        error.response?.data || // or the whole data string/object
        error.message || // fallback to general JS error message
        "Error registering. Please check your input.";
  
      setAlertMessage(errorMsg);
      setAlertType("error");
  
      setRegisterDetails({
        username: "",
        firstName: "",
        lastName: "",
        password: "",
        email: "",
        role: "User", // keep default role on reset
      });
  
      setTimeout(() => {
        setAlertMessage("");
      }, 4000);
    }
  };
  

  useEffect(() => {
    if (activeTab === "manageproducts") {
      fetchCategories(); // <-- Fetch only when needed
      fetchProducts(); // <-- Optional: also re-fetch products if needed
    }
  }, [activeTab]);

  /* logic to clear any output when the user chooses a different page/tab as well as ensuring for search that no products show until the search input has been returned*/

  useEffect(() => {
    clearForm();

    if (["all", "delete"].includes(activeTab)) {
      fetchActiveProducts();
      fetchCategories(); // ✅ Add this
      setSearchPerformed(true);
    } else {
      setProducts([]); // Clear previous results
      setSearchPerformed(false); // Prevent showing products until search is done
    }
    //eslint-disable-next-line
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
            {dashboardTab === "transactions" && <Transactions />}
            {dashboardTab === "manageusers" && <ManageUsers />}
            <ToastContainer position="top-right" autoClose={3000} />
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
                    {alertMessage && alertType === "success" && (
                      <div className="custom-alert success">{alertMessage}</div>
                    )}
                    {alertMessage && alertType === "error" && (
                      <div className="custom-alert error">{alertMessage}</div>
                    )}
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
                    {/* <div className="field">
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
                    </div> */}
                    <div className="field btn">
                      <div className="btn-layer"></div>
                      <input type="submit" value="Signup" />
                    </div>
                    {alertMessage && alertType === "success" && (
                      <div className="custom-alert success">{alertMessage}</div>
                    )}
                    {alertMessage && alertType === "error" && (
                      <div className="custom-alert error">{alertMessage}</div>
                    )}
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
                        {/* Search Input Styled as Button */}
                        <input
                          type="text"
                          placeholder="Search products..."
                          value={searchTerm}
                          onChange={(e) => {
                            const newValue = e.target.value;
                            setSearchTerm(newValue);
                            if (newValue.trim() === "") {
                              fetchActiveProducts(); // Reset to all products if search is cleared
                            } else {
                              fetchActiveProductsByName(newValue);
                            }
                          }}
                          className="category-btn search-input" // apply button styling + optional input-specific tweaks
                        />

                        {/* "All" Button */}
                        <button
                          className={`category-btn ${
                            lastSelectedCategoryRef.current === "All"
                              ? "selected"
                              : ""
                          }`}
                          onClick={() => {
                            lastSelectedCategoryRef.current = "All";
                            fetchActiveProducts();
                            setCurrentPage(1);
                          }}
                        >
                          All
                        </button>

                        {/* Category Buttons */}
                        {categories.map((cat) => (
                          <button
                            key={cat.categoryId}
                            className={`category-btn ${
                              lastSelectedCategoryRef.current ===
                              cat.categoryName
                                ? "selected"
                                : ""
                            }`}
                            onClick={() => {
                              lastSelectedCategoryRef.current =
                                cat.categoryName;
                              fetchActiveProductsByCategory(cat.categoryName);
                              setCurrentPage(1);
                            }}
                          >
                            {cat.categoryName}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="products-list">
                    {products.length === 0 ? (
                      <p>No products found.</p>
                    ) : (
                      currentProducts.map((p) => (
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
                              |Qty:{p.quantity}| |
                              <strong>
                                R{parseFloat(p.unitPrice).toFixed(2)}
                              </strong>{" "}
                              |
                            </p>
                            <button
                              className="add-to-cart-btn"
                              onClick={() => handleAddToCart(p)}
                              disabled={p.quantity <= 0}
                            >
                              {p.quantity > 0
                                ? "Add to Cart 🛒"
                                : "Out of Stock"}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  {/* Pagination Controls */}
                  {products.length > productsPerPage && (
                    <div className="pagination">
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
                          setCurrentPage((prev) =>
                            Math.min(prev + 1, totalPages)
                          )
                        }
                        disabled={currentPage === totalPages}
                      >
                        Next
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default App;
