import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../LoginSignup.css";
import { toast } from "react-toastify";

const Sidebar = ({ onMenuClick }) => {
  const [reportOpen, setReportOpen] = useState(false);
  const navigate = useNavigate();

  const handleItemClick = (tab) => {
    const user = JSON.parse(localStorage.getItem("user")); // Retrieve user from localStorage
    const isSuperUser = user?.role?.toLowerCase() === "superuser";
  
    const restrictedTabs = ["manageproducts"]; // Tabs restricted to superusers
  
    if (restrictedTabs.includes(tab) && !isSuperUser) {
      toast.error("You are not authorised to perform this action.");
      return; // Stop execution if unauthorized
    }

    onMenuClick(tab);

    if (tab === "manageproducts") {
      navigate("/manageproducts");
    } else if (tab === "wallet") {
      navigate("/wallet");
    } else if (tab === "add") {
      navigate("/add");
    } else if (tab === "all") {
      navigate("/all");
    } else if (tab === "transactions") {
      navigate("/transactions");
    }
  };

  const toggleReport = () => {
    setReportOpen(!reportOpen);
  };

  return (
    <div className="sidebar fixed-open">
      <img src="/images/Logo_Option_2.jpg" alt="Logo" className="sidebar-logo" />

      <ul>
        <li>
          <span className="menu-heading" onClick={() => handleItemClick("all")}>
            Product Purchase
          </span>
        </li>
        <li>
          <span className="menu-heading" onClick={() => handleItemClick("manageproducts")}>
            Product Management
          </span>
        </li>
        <li>
          <span className="menu-heading" onClick={() => handleItemClick("wallet")}>
            Wallet
          </span>
        </li>
        <li>
          <span
            className="menu-heading"
            onClick={toggleReport}
            style={{
              cursor: "pointer",
              userSelect: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.3rem",
            }}
          >
            Report
            <span style={{ fontSize: "0.7rem" }}>
              {reportOpen ? "▲" : "▼"}
            </span>
          </span>
          {reportOpen && (
            <ul
              className="submenu"
              style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}
            >
              <li>
                <span
                  className="menu-subitem"
                  onClick={() => handleItemClick("transactions")}
                  style={{ cursor: "pointer", color: "black" }}
                >
                  Transaction History
                </span>
              </li>
            </ul>
          )}
        </li>
      </ul>
    </div>
  );
};

export default Sidebar;
