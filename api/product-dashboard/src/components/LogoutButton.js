import React from "react";
import "../LoginSignup.css";

const LogoutButton = ({ onLogout }) => {
  return (
    <button className="logout-btn" onClick={onLogout}>
      Logout
    </button>
  );
};

export default LogoutButton;
