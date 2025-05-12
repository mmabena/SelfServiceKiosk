import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';  // Import useNavigate from react-router-dom
import '../LoginSignup.css';

const Sidebar = ({ onMenuClick }) => {
  const [openMenus, setOpenMenus] = useState({
    purchase: true,
    manage: true
  });

  const navigate = useNavigate();  // Initialize navigate function

  // Handle item click and navigation
  const handleItemClick = (tab) => {
    onMenuClick(tab);

    // Navigate to different pages based on the tab clicked
    if (tab === "manageproducts") {
      navigate('/manageproducts');  // Navigate to the Manage Products page
    } else if (tab === "wallet") {
      navigate('/wallet');  // Navigate to the Wallet page
    } else if (tab === "add") {
      navigate('/add');  // Navigate to another page, such as Report
    }else if (tab === "all") {
      navigate('/all'); 
    }
  };

  return (
    <div className="sidebar fixed-open">
      <img src="/images/Logo_Option_2.jpg" alt="Logo" className="sidebar-logo" />

      <ul>
        <li>
          <span className="menu-heading" onClick={() => handleItemClick("all")}>
            Purchase Products
          </span>
        </li>
        <li>
          <span
            className="menu-heading"
            onClick={() => handleItemClick("manageproducts")}
          >
            Product Management
          </span>
        </li>
        <li>
          <span
            className="menu-heading"
            onClick={() => handleItemClick("wallet")}
          >
            Wallet
          </span>
        </li>
        <li>
          <span
            className="menu-heading"
            onClick={() => handleItemClick("add")}
          >
            Report
          </span>
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
