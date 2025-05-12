import React, { useState, useEffect, useCallback } from "react";
import '../LoginSignup.css';

const Wallet = () => {
  const [balance, setAmount] = useState(""); // User input amount
  const [funds, setFunds] = useState(0); // Initial funds state
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]); // To store the list of users if superuser
  const [selectedUserId, setSelectedUserId] = useState(""); // For superuser to select the user

  // Get logged-in user details
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId; // Correct key
  const isSuperUser = user?.role === "SuperUser";

  // Fetch wallet balance from the server
  const fetchBalance = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5219/api/wallet/${userId}`);
      if (!response.ok) throw new Error("Wallet not found.");
      const data = await response.json();
      setFunds(data.balance); // Update wallet balance state
    } catch (error) {
      console.error("Failed to fetch balance:", error.message);
      setFunds(0); // If fetching fails, reset to 0
    }
  }, [userId]);

  // Load balance on mount
  useEffect(() => {
    if (userId) {
      fetchBalance();
    }
    if (isSuperUser) {
      fetchUsers(); // If superuser, fetch the list of normal users
    }
  }, [userId, isSuperUser, fetchBalance]);

  // Fetch the list of users for superuser
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5219/api/user"); // Assuming endpoint to fetch users
      if (!response.ok) throw new Error("Failed to fetch users.");
      const data = await response.json();
      setUsers(data); // Set the list of users
    } catch (error) {
      console.error("Failed to fetch users:", error.message);
    }
  };

  // Handle adding funds
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

  // Handle superuser allocating funds to another user
  const handleAddAmountToUser = async () => {
    const numericAmount = parseFloat(balance);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    if (numericAmount > 1000) {
      alert("You can only add up to R1000.");
      return;
    }

    if (!selectedUserId) {
      alert("Please select a user to add funds to.");
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to add R${numericAmount.toFixed(2)} to this user's wallet?`
    );

    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5219/api/wallet/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId, // Use selected user ID for superuser
          balance: numericAmount,
        }),
      });

      if (!response.ok) throw new Error("Something went wrong!");

      alert("Funds added successfully!");
      setAmount(""); // Clear the input field
    } catch (err) {
      alert(err.message || "Failed to add funds.");
    } finally {
      setLoading(false);
    }
  };

  if (!userId) {
    return <p>⚠️ User not found. Please log in.</p>;
  }

  return (
    <div className="wallet-wrapper">
      <div className="wallet-container">
        <h2>💰 Your Wallet</h2>
        <p>Current Balance: <strong>R{(funds ?? 0).toFixed(2)}</strong></p>

        {/* Display the input field */}
        <input
          type="number"
          placeholder="Enter amount (max R1000)"
          value={balance}
          onChange={(e) => setAmount(e.target.value)}
          max="1000"
          className="wallet-input"
        />

        {/* If superuser, allow selection of another user */}
        {isSuperUser && (
          <div>
            <label>Select User to Add Funds</label>
            <select
              className="wallet-input"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
            >
              <option value="">Select User</option>
              {users.length > 0 ? (
                users.map((user) => (
                  <option key={user.userId} value={user.userId}>
                    {user.firstName} {user.lastName}
                  </option>
                ))
              ) : (
                <option disabled>No users available</option>
              )}
            </select>
          </div>
        )}

        {/* Button for adding funds to wallet */}
        <button onClick={isSuperUser ? handleAddAmountToUser : handleAddAmount} disabled={loading}>
          {loading ? "Adding..." : "Add to Wallet"}
        </button>
      </div>
    </div>
  );
};

export default Wallet;
