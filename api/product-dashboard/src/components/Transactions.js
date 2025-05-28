import React, { useState, useEffect } from "react";
import axios from "axios";
import "../LoginSignup.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const [cartDetails, setCartDetails] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);
  const [cartError, setCartError] = useState("");
  const [showCartModal, setShowCartModal] = useState(false);

  const transactionsPerPage = 5;
  const totalPages = Math.ceil(transactions.length / transactionsPerPage);

  const paginatedTransactions = transactions.slice(
    (currentPage - 1) * transactionsPerPage,
    currentPage * transactionsPerPage
  );

  useEffect(() => {
    async function fetchTransactionsAndCarts() {
      try {
        setLoading(true);
        const user = JSON.parse(localStorage.getItem("user"));
        const userRole = user?.role?.toLowerCase();
        const userId = user?.userId || user?.id;

        let url = "http://localhost:5219/api/transaction/all";

        if (userRole !== "superuser") {
          url = `http://localhost:5219/api/transaction/user/${userId}`;
        }

        const res = await axios.get(url);
        const transactionsData = res.data;

        const cartsPromises = transactionsData.map((tx) =>
          axios
            .get(`http://localhost:5219/api/cart/${tx.cartId || tx.cartID}`)
            .then((cartRes) => cartRes.data)
            .catch(() => null)
        );

        const cartsData = await Promise.all(cartsPromises);

        const transactionsWithUser = transactionsData.map((tx, idx) => {
          const cart = cartsData[idx];
          return {
            ...tx,
            userFirstName: cart?.user?.firstName || null,
            userLastName: cart?.user?.lastName || null,
          };
        });

        setTransactions(transactionsWithUser);
        setErrorMessage("");
      } catch (err) {
        setErrorMessage("Failed to load transactions.");
        toast.error("Error fetching transactions or carts.");
      } finally {
        setLoading(false);
      }
    }

    fetchTransactionsAndCarts();
  }, []);

  const fetchCartDetails = async (cartId) => {
    try {
      setCartLoading(true);
      setCartError("");
      setCartDetails(null);

      const res = await axios.get(`http://localhost:5219/api/cart/${cartId}`);
      setCartDetails(res.data);
      setShowCartModal(true);
    } catch (err) {
      setCartError("Failed to fetch cart details.");
      toast.error("Error fetching cart details.");
    } finally {
      setCartLoading(false);
    }
  };

  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperUser = user?.role?.toLowerCase() === "superuser";

  if (loading) return <p style={{ padding: "20px" }}>Loading transactions...</p>;
  if (errorMessage)
    return (
      <p style={{ padding: "20px", color: "red" }}>
        Error: {errorMessage}
      </p>
    );

  return (
    <div className="product-table-container" style={{ padding: "20px" }}>
      <ToastContainer position="bottom-right" autoClose={4000} />
      <h2>{isSuperUser ? "Transaction History" : "Your Transactions"}</h2>

      <div className="table-wrapper" style={{ marginTop: "20px" }}>
        <table className="product-table" style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Transaction ID</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>User Name</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Transaction Date</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Order Type</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Total Amount (R)</th>
              <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedTransactions.length === 0 ? (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>No transactions found.</td>
              </tr>
            ) : (
              paginatedTransactions.map((tx) => (
                <tr key={tx.transactionId}>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{tx.transactionId}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {tx.userFirstName && tx.userLastName
                      ? `${tx.userFirstName} ${tx.userLastName}`
                      : "N/A"}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>
                    {new Date(tx.transactionDate).toLocaleString()}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px" }}>{tx.orderType}</td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                   R{Number(tx.totalAmount).toFixed(2)}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                    {(tx.cartId || tx.cartID) ? (
                      <button
                        onClick={() => fetchCartDetails(tx.cartId || tx.cartID)}
                        className="btn-blue"
                        style={{ padding: "6px 12px" }}
                      >
                        View Cart
                      </button>
                    ) : (
                      "No Cart"
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div
        className="pagination"
        style={{
          marginTop: "15px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
          className="btn-blue"
          style={{ padding: "6px 12px" }}
        >
          Previous
        </button>
        <span>
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="btn-blue"
          style={{ padding: "6px 12px" }}
        >
          Next
        </button>
      </div>

      {/* Cart Modal */}
      {showCartModal && (
        <div
          className="modal-overlay"
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 9999,
          }}
          onClick={() => setShowCartModal(false)}
        >
          <div
            className="modal-content"
            style={{
              backgroundColor: "#fff",
              padding: "20px",
              borderRadius: "8px",
              width: "90%",
              maxWidth: "600px",
              maxHeight: "80vh",
              overflowY: "auto",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowCartModal(false)}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                fontSize: "18px",
                background: "none",
                border: "none",
                cursor: "pointer",
              }}
            >
              &times;
            </button>
            <h3>Cart Details (CART ID: {cartDetails?.cartId})</h3>

            {cartLoading && <p>Loading cart products...</p>}
            {cartError && <p style={{ color: "red" }}>{cartError}</p>}

            {!cartLoading && cartDetails && (
              cartDetails.cartProducts.length === 0 ? (
                <p>No products found in this cart.</p>
              ) : (
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    border: "1px solid #ddd",
                  }}
                >
                  <thead>
                    <tr>
                      <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "left" }}>Name</th>
                      <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>Quantity</th>
                      <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Unit Price (R)</th>
                      <th style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>Total (R)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cartDetails.cartProducts.map((cp) => (
                      <tr key={cp.cartProductId}>
                        <td style={{ border: "1px solid #ddd", padding: "8px" }}>{cp.product.productName}</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>{cp.quantity}</td>
                        <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                          R{Number(cp.product.unitPrice).toFixed(2)}
                        </td>
                        <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "right" }}>
                          R{(cp.quantity * cp.product.unitPrice).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Transactions;
