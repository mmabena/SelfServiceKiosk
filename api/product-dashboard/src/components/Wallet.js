import React, { useState, useEffect, useCallback } from "react";
import '../LoginSignup.css';

// const Wallet = ({ setWalletBalance, walletBalance }) => {
const Wallet = () => {
  const [balance, setAmount] = useState(""); // User input amount
  const [funds, setFunds] = useState(0); // Initial funds state
  const [loading, setLoading] = useState(false);

  const userId = JSON.parse(localStorage.getItem("user"))?.id;

  // Fetch wallet balance from the server
  const fetchBalance = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5219/api/wallet/${userId}`);
      if (!response.ok) throw new Error("Wallet not found.");
      const data = await response.json();
      setFunds(data.balance); // Update wallet balance state
      // If you want to use the `setWalletBalance` to update the parent, uncomment the following line
      // setWalletBalance(data.balance); // Update wallet balance in parent (App.js)
    } catch (error) {
      console.error("Failed to fetch balance:", error.message);
      setFunds(0); // If fetching fails, reset to 0
      // If you want to use the `setWalletBalance` to reset the parent value, uncomment the following line
      // setWalletBalance(0); // Reset wallet balance in parent (App.js)
    }
  }, [userId]);

  // Load balance on mount
  useEffect(() => {
    if (userId) {
      fetchBalance();
    }
  }, [userId, fetchBalance]);

  if (!userId) {
    return <p>⚠️ User not found. Please log in.</p>;
  }

  const handleAddAmount = async () => {
    const numericAmount = parseFloat(balance);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (numericAmount > 1000) {
      alert("You can only add up to R1000.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to add R${numericAmount.toFixed(2)} to your wallet?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5219/api/wallet/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          balance: numericAmount,
        }),
      });

      if (!response.ok) throw new Error("Something went wrong!");

      // Re-fetch balance after adding funds
      await fetchBalance();
      setAmount(""); // Clear the input field
    } catch (err) {
      alert(err.message || "Failed to add funds.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="wallet-wrapper">
      <div className="wallet-container">
        <h2>💰 Your Wallet</h2>
        <p>Current Balance: <strong>R{(funds ?? 0).toFixed(2)}</strong></p>

        <input
          type="number"
          placeholder="Enter amount (max R1000)"
          value={balance}
          onChange={(e) => setAmount(e.target.value)}
          max="1000"
          className="wallet-input"
        />
        <button onClick={handleAddAmount} disabled={loading}>
          {loading ? "Adding..." : "Add to Wallet"}
        </button>
      </div>

      {/* Display the wallet balance button */}
      {/* <div className="cart-container">
        <button className="cart-button wallet-button">
          💰 R{(walletBalance ?? 0).toFixed(2)} {/* Display wallet balance */}
        {/* </button>
      </div> */} 
    </div>
  );
};

export default Wallet;
