import React, { useEffect, useState, useRef, useCallback } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../LoginSignup.css";

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isSuperUser, setIsSuperUser] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [userForm, setUserForm] = useState({
    userId: "",
    firstName: "",
    lastName: "",
    email: "",
    username: "",
    password: "",
    role: "",
  });

  const updateFormRef = useRef(null);
  const addFormRef = useRef(null);

  // Helper to get token safely
  const getToken = () => localStorage.getItem("token");

  // Email validation for @singular.co.za domain
  const validateEmail = (email) => /^[^\s@]+@singular\.co\.za$/.test(email);

  // Password strong validation: 8+ chars, uppercase, lowercase, number, special
  const validatePassword = (password) =>
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_\-+=<>?{}[\]~]).{8,}$/.test(
      password
    );

  const fetchCurrentUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.warn("No token found in localStorage.");
      return;
    }

    try {
      console.log("Fetching current user...");
      const res = await axios.get("http://localhost:5219/api/user", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const userIdFromToken = parseInt(
        tokenData[
          "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
        ]
      );

      const loggedInUser = res.data.find((u) => u.userId === userIdFromToken);

      console.log("Decoded token:", tokenData);

      setCurrentUser(loggedInUser);
      setIsSuperUser(tokenData.roleName === "SuperUser");
      if (tokenData.roleName === "SuperUser") {
        setUsers(res.data);
      } else if (loggedInUser) {
        setUsers([loggedInUser]);
      }

      console.log("Users fetched:", res.data);
    } catch (err) {
      console.error("fetchCurrentUser error:", err.response || err);
      toast.error(err.response?.data || "Failed to fetch users.");
    }
  }, []);

  const fetchRoles = async () => {
    try {
      console.log("Fetching roles...");
      const res = await axios.get("http://localhost:5219/api/user/roles");
      setRoles(res.data);
      console.log("Roles fetched:", res.data);
    } catch (err) {
      console.error("fetchRoles error:", err.response || err);
      toast.error(err.response?.data || "Failed to fetch roles.");
    }
  };

  useEffect(() => {
    fetchCurrentUser();
    fetchRoles();
  }, [fetchCurrentUser]);

  const handleEditClick = (user) => {
    setUserForm({ ...user, password: "" }); // password empty on edit (optional)
    setEditUser(user);
    setTimeout(
      () => updateFormRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const handleAddClick = () => {
    setUserForm({
      userId: "",
      firstName: "",
      lastName: "",
      email: "",
      username: "",
      password: "",
      role: "",
    });
    setIsAddingUser(true);
    setTimeout(
      () => addFormRef.current?.scrollIntoView({ behavior: "smooth" }),
      100
    );
  };

  const handleUpdateUser = async (e) => {
    e.preventDefault();

    // Validate email
    if (!validateEmail(userForm.email)) {
      toast.error("Email must be a valid @singular.co.za address.");
      return;
    }

    // Prepare the data to be sent
    const updatedData = { ...userForm };

    // Include password only if it's provided
    if (userForm.password) {
      if (!validatePassword(userForm.password)) {
        toast.error(
          "Password must be 8+ chars with uppercase, lowercase, number, and special character."
        );
        return;
      }
    } else {
      // Remove the password key entirely if user hasn't entered a new one
      delete updatedData.password;
    }

    // Authentication token
    const token = getToken();
    if (!token) {
      toast.error("Authentication token missing. Please log in again.");
      return;
    }

    try {
      // Send the update request
      await axios.put(
        `http://localhost:5219/api/user/${userForm.userId}`,
        updatedData,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("User updated successfully.");
      setEditUser(null);
      fetchCurrentUser();
    } catch (err) {
      console.error("Update user error:", err.response?.data || err.message);
      toast.error(err.response?.data?.message || "Failed to update user.");
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();

    if (!validateEmail(userForm.email)) {
      toast.error("Email must be a valid @singular.co.za address.");
      return;
    }
    if (!validatePassword(userForm.password)) {
      toast.error(
        "Password must be 8+ chars with uppercase, lowercase, number, and special character."
      );
      return;
    }

    const token = getToken();
    if (!token) {
      toast.error("Authentication token missing. Please log in again.");
      return;
    }

    try {
      console.log("Adding user:", userForm);
      await axios.post("http://localhost:5219/api/user/register", userForm, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("User added successfully.");
      setIsAddingUser(false);
      fetchCurrentUser();
    } catch (err) {
      console.error("Add user error:", err.response || err);
      toast.error(err.response?.data || "Failed to add user.");
    }
  };

  const handleToggleUserActive = async (userId) => {
    const token = getToken();
    if (!token) {
      toast.error("Authentication token missing. Please log in again.");
      return;
    }

    try {
      const res = await axios.put(
        `http://localhost:5219/api/user/toggle-active/${userId}`,
        null,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const { isActive, message } = res.data;
      toast.success(message);

      // Update the user in state directly
      setUsers((prevUsers) =>
        prevUsers.map((u) => (u.userId === userId ? { ...u, isActive } : u))
      );
    } catch (err) {
      console.error("Toggle user status error:", err);
      toast.error(err.response?.data || "Failed to toggle user status.");
    }
  };

  const canEdit = (userId) => isSuperUser || currentUser?.userId === userId;

  return (
    <div className="product-table-container">
      <ToastContainer position="bottom-right" autoClose={4000} />
      <h2>User Management</h2>

      {isSuperUser && (
        <div className="product-actions">
          <button className="cancel-btn action-button" onClick={handleAddClick}>
            Add User
          </button>
        </div>
      )}

      <div className="table-wrapper">
        <table className="product-table">
          <thead>
            <tr>
              <th>Username</th>
              <th>Name</th>
              <th>Email</th>
              {isSuperUser && <th>Role</th>}
              {isSuperUser && <th>Status</th>}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.filter(Boolean).map((user) => (
              <tr key={user.userId}>
                <td>{user.username}</td>
                <td>
                  {user.firstName} {user.lastName}
                </td>
                <td>{user.email}</td>
                {isSuperUser && <td>{user.role}</td>}
                {isSuperUser && (
        <td>
          <span
            style={{
              color: user.isActive ? "green" : "red",
              fontWeight: "bold",
            }}
          >
            {user.isActive ? "Active" : "Inactive"}
          </span>
        </td>
      )}
                <td>
                  {canEdit(user.userId) && (
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button
                        className="btn-blue action-button-1"
                        onClick={() => handleEditClick(user)}
                      >
                        Edit
                      </button>
                      {isSuperUser && (
                        <button
                          className="btn-blue action-button"
                          onClick={() => {
                            const action = user.isActive
                              ? "deactivate"
                              : "activate";
                            if (
                              window.confirm(
                                `Are you sure you want to ${action} user "${user.firstName}"?`
                              )
                            ) {
                              handleToggleUserActive(user.userId);
                            }
                          }}
                          style={{
                            backgroundColor: user.isActive
                              ? "#d42f2f"
                              : "#2ecc71",
                          }}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>
                      )}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editUser && (
        <div ref={updateFormRef} className="update-form-container">
          <h3>Update User</h3>
          <form className="update-form" onSubmit={handleUpdateUser}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={userForm.firstName}
                onChange={(e) =>
                  setUserForm({ ...userForm, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={userForm.lastName}
                onChange={(e) =>
                  setUserForm({ ...userForm, lastName: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Password </label>
              <input
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({ ...userForm, password: e.target.value })
                }
                // Password not required on update
              />
            </div>
            {isSuperUser && (
              <div className="form-group">
                <label>Role</label>
                <select
                  value={userForm.role}
                  onChange={(e) =>
                    setUserForm({ ...userForm, role: e.target.value })
                  }
                  required
                >
                  <option value="">Select Role</option>
                  {roles.map((r) => (
                    <option key={r.userRoleId} value={r.roleName}>
                      {r.roleName}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <button type="submit" className="btn-blue">
              Update User
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setEditUser(null)}
              style={{ backgroundColor: "#ccc" }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}

      {isAddingUser && (
        <div ref={addFormRef} className="add-form-container">
          <h3>Add User</h3>
          <form className="add-form" onSubmit={handleAddUser}>
            <div className="form-group">
              <label>First Name</label>
              <input
                type="text"
                value={userForm.firstName}
                onChange={(e) =>
                  setUserForm({ ...userForm, firstName: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Last Name</label>
              <input
                type="text"
                value={userForm.lastName}
                onChange={(e) =>
                  setUserForm({ ...userForm, lastName: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input
                type="text"
                value={userForm.username}
                onChange={(e) =>
                  setUserForm({ ...userForm, username: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={userForm.email}
                onChange={(e) =>
                  setUserForm({ ...userForm, email: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                value={userForm.password}
                onChange={(e) =>
                  setUserForm({ ...userForm, password: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Role</label>
              <select
                value={userForm.role}
                onChange={(e) =>
                  setUserForm({ ...userForm, role: e.target.value })
                }
                required
              >
                <option value="">Select Role</option>
                {roles.map((r) => (
                  <option key={r.userRoleId} value={r.roleName}>
                    {r.roleName}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-blue">
              Add User
            </button>
            <button
              type="button"
              className="cancel-btn"
              onClick={() => setIsAddingUser(false)}
              style={{
                marginTop: "10px",
                marginLeft: "10px",
                backgroundColor: "#ccc",
              }}
            >
              Cancel
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default ManageUsers;
