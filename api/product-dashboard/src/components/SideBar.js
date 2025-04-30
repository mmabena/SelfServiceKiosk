import React, { useState } from 'react';
import '../LoginSignup.css';
//import logo from '../Self-Service-Kiosk-Logo/Self-Service-Kiosk-Logo.png';  // Relative path to the image file

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

  const handleItemClick = (tab) => {
    onMenuClick(tab);
    setIsOpen(false); // Close sidebar
  };

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <img
        src="/images/logo_self.jpg"
        alt="Logo"
        className="sidebar-logo"
      />

      <ul>
        <li onClick={() => handleItemClick('landing')}>
          <a href="#" className="menu-heading">Home</a>
        </li>

        <li>
          <span onClick={() => toggleMenu('purchase')} className="menu-heading">
            Purchase Products ▾
          </span>
          {openMenus.purchase && (
            <ul>
              <li onClick={() => handleItemClick('all')}>
                <a href="#">All Products</a>
              </li>
              {/* <li onClick={() => handleItemClick('byCategory')}>
                <a href="#">Search Product</a>
              </li> */}
            </ul>
          )}
        </li>

        {/* You can conditionally render this block for specific roles if needed */}
        <li>
          <span onClick={() => toggleMenu('manage')} className="menu-heading">
            Product Management ▾
          </span>
          {openMenus.manage && (
            <ul>
              <li onClick={() => handleItemClick('add')}>
                <a href="#">Add Product</a>
              </li>
              <li onClick={() => handleItemClick('update')}>
                <a href="#">Update Product</a>
              </li>
              <li onClick={() => handleItemClick('delete')}>
                <a href="#">Delete Product</a>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;