import React, { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../LoginSignup.css";

const Wallet = () => {
  const [balance, setAmount] = useState(""); // User input for amount
  const [funds, setFunds] = useState(0); // User's current wallet balance
  const [loading, setLoading] = useState(false); // Loading state
  const [users, setUsers] = useState([]); // List of users if superuser
  const [selectedUserId, setSelectedUserId] = useState(""); // For superuser to select a user
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering users
  const [filteredUsers, setFilteredUsers] = useState([]); // Filtered users based on search term

  // Fetch logged-in user details from localStorage
  const user = JSON.parse(localStorage.getItem("user"));
  const userId = user?.userId; // User ID from the logged-in user
  const isSuperUser = user?.role === "SuperUser"; // Check if the logged-in user is a superuser

  // Fetch the wallet balance from the server
  const fetchBalance = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:5219/api/wallet/${userId}`);
      if (!response.ok) throw new Error("Wallet not found.");
      const data = await response.json();
      setFunds(data.balance); // Set wallet balance
    } catch (error) {
      toast.error("Failed to fetch balance:", error.message);
      setFunds(0); // Default to 0 if there's an error fetching balance
    }
  }, [userId]);

  // Fetch the list of users if superuser
  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:5219/api/user");
      if (!response.ok) throw new Error("Failed to fetch users.");
      const data = await response.json();
      setUsers(data); // Set users list
    } catch (error) {
      toast.error("Failed to fetch users:", error.message);
    }
  };

  // Load balance and fetch users if superuser
  useEffect(() => {
    if (userId) {
      fetchBalance();
    }
    if (isSuperUser) {
      fetchUsers(); // Fetch the list of users if superuser
    }
  }, [userId, isSuperUser, fetchBalance]);

  // Handle adding funds to the wallet
  const handleAddAmount = async () => {
    const numericAmount = parseFloat(balance);

    // Validation: check if the amount is valid
    if (isNaN(numericAmount) || numericAmount <= 0 || numericAmount > 1000) {
      toast.error("Enter a valid amount (1 - 1000).");
      return;
    }

    const confirmed = window.confirm(`Add R${numericAmount.toFixed(2)} to wallet?`);
    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await fetch("http://localhost:5219/api/wallet/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: isSuperUser ? selectedUserId : userId, // Add funds to selected user if superuser
          balance: numericAmount,
        }),
      });

      if (!response.ok) throw new Error("Something went wrong!");

      if (!isSuperUser) await fetchBalance(); // Refresh balance if not superuser
      toast.success("Funds added successfully!");
      setAmount(""); // Clear the amount field

      //force wallet refresh
      await fetchBalance();
    } catch (err) {
      toast.error(err.message || "Failed to add funds.");
    } finally {
      setLoading(false); // Disable loading after the process finishes
    }
  };

  // If the user is not logged in, show a message
  if (!userId) {
    return <p>⚠️ User not found. Please log in.</p>;
  }

  return (
    <div className="wallet-wrapper">
      <div className="wallet-container">
        <h2>💰 Your Wallet</h2>
        <p>
          Current Balance: <strong>R{(funds ?? 0).toFixed(2)}</strong>
        </p>

        {/* Input field to enter amount */}
        <input
          type="number"
          placeholder="Enter amount (max R1000)"
          value={balance}
          onChange={(e) => setAmount(e.target.value)}
          max="1000"
          className="wallet-input"
        />

        {/* If superuser, show the user selection input */}
        {isSuperUser && (
          <div className="wallet-input-container">
            <label>Select User to Add Funds</label>
            <input
              type="text"
              className="wallet-input"
              placeholder="Search user..."
              value={searchTerm}
              onChange={(e) => {
                const term = e.target.value;
                setSearchTerm(term);
                const filtered = users.filter((user) =>
                  `${user.firstName} ${user.lastName}`.toLowerCase().includes(term.toLowerCase())
                );
                setFilteredUsers(filtered); // Update filtered users based on search term
              }}
            />

            {/* Display the dropdown only if there are filtered users */}
            {filteredUsers.length > 0 && (
              <div className="dropdown-menu">
                {filteredUsers.map((user) => (
                  <div
                    key={user.userId}
                    onClick={() => {
                      setSelectedUserId(user.userId); // Select a user from the dropdown
                      setSearchTerm(`${user.firstName} ${user.lastName}`); // Set the search term to the selected name
                      setFilteredUsers([]); // Clear the filtered users list after selection
                    }}
                    className="dropdown-item"
                  >
                    {user.firstName} {user.lastName}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Button to add funds to the wallet */}
        <button
          onClick={handleAddAmount}
          disabled={loading || (isSuperUser && !selectedUserId)} // Disable if loading or no user selected for superuser
        >
          {loading ? "Adding..." : "Add to Wallet"}
        </button>
      </div>
    </div>
  );
};

export default Wallet;
