import React, { useState } from 'react';
import '../LoginSignup.css';
import logo from '../Self-Service-Kiosk-Logo/Self-Service-Kiosk-Logo.png';

const Sidebar = ({  onMenuClick, isOpen, }) => {
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

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <img src={logo} alt="Self-Service Kiosk Logo" className="sidebar-logo" />

      <ul>
        <li onClick={() => onMenuClick('landing')}>
          <a href="#" className="menu-heading">Home</a>
        </li>

        <li>
        <span onClick={() => toggleMenu('purchase')} className="menu-heading">
  Purchase Products ▾
</span>
          {openMenus.purchase && (
            <ul>
              <li onClick={() => onMenuClick('all')}>
                <a href="#">All Products</a>
              </li>
              <li onClick={() => onMenuClick('byCategory')}>
                <a href="#">Search Product</a>
              </li>
            </ul>
          )}
        </li>

        {/* {userRole?.toLowerCase() === 'superuser' && ( */}
          <li>
            <span onClick={() => toggleMenu('manage')} className="menu-heading">Product Management▾</span>
            {openMenus.manage && (
              <ul>
                <li onClick={() => onMenuClick('add')}>
                  <a href="#">Add Product</a>
                </li>
                <li onClick={() => onMenuClick('update')}>
                  <a href="#">Update Product</a>
                </li>
                <li onClick={() => onMenuClick('delete')}>
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
