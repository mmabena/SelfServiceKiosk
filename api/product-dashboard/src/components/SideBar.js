import React, { useState } from 'react';
import '../LoginSignup.css';
import logo from '../Self-Service-Kiosk-Logo/Self-Service-Kiosk-Logo.png';

const Sidebar = ({ onMenuClick, isOpen, setIsOpen }) => {
  const [openMenus, setOpenMenus] = useState({
    purchase: false,
    manage: false
  });

  const toggleMenu = (menu) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  // Close the entire sidebar and handle the menu item click
  const handleMenuItemClick = (menu, action) => {
    setIsOpen(false); // Close the sidebar when a menu item is clicked

    // Close the specific menu after a click
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: false
    }));

    // Call the action passed through props (onMenuClick) to handle the logic for the menu item
    onMenuClick(action);
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <img src={logo} alt="Self-Service Kiosk Logo" className="sidebar-logo" />

      <ul>
        <li onClick={() => handleMenuItemClick('landing', 'landing')}>
          <a href="#" className="menu-heading">Home</a>
        </li>

        <li>
          <span onClick={() => toggleMenu('purchase')} className="menu-heading">
            Purchase Products ▾
          </span>
          {openMenus.purchase && (
            <ul>
              <li onClick={() => handleMenuItemClick('purchase', 'all')}>
                <a href="#">All Products</a>
              </li>
              <li onClick={() => handleMenuItemClick('purchase', 'byCategory')}>
                <a href="#">Search Product</a>
              </li>
            </ul>
          )}
        </li>

        {/* {userRole?.toLowerCase() === 'superuser' && ( */}
        <li>
          <span onClick={() => toggleMenu('manage')} className="menu-heading">
            Product Management ▾
          </span>
          {openMenus.manage && (
            <ul>
              <li onClick={() => handleMenuItemClick('manage', 'add')}>
                <a href="#">Add Product</a>
              </li>
              <li onClick={() => handleMenuItemClick('manage', 'update')}>
                <a href="#">Update Product</a>
              </li>
              <li onClick={() => handleMenuItemClick('manage', 'delete')}>
                <a href="#">Delete Product</a>
              </li>
            </ul>
          )}
        </li>
        {/* )} */}
      </ul>
    </div>
  );
};

export default Sidebar;
