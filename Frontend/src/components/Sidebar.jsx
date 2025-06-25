import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home, FileText, User, BarChart, LogOut, Clock } from "lucide-react";
import "./Sidebar.css";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const role = localStorage.getItem("role"); 

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="d-flex align-items-center">
          <div className="sidebar-logo">
            <span>EA</span>
          </div>
          <span className="ms-2 h5 mb-0 fw-bold text-light">
            {role === "admin" ? "Admin Panel" : "Excel Analytics"}
          </span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link
              to="/dashboard"
              className={`nav-link d-flex align-items-center ${
                location.pathname === "/dashboard" ? "active" : ""
              }`}
            >
              <Home size={20} className="nav-icon" />
              <span className="nav-text">Home</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/files"
              className={`nav-link d-flex align-items-center ${
                location.pathname === "/files" ? "active" : ""
              }`}
            >
              <FileText size={20} className="nav-icon" />
              <span className="nav-text">Files</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/chart"
              className={`nav-link d-flex align-items-center ${
                location.pathname === "/chart" ? "active" : ""
              }`}
            >
              <BarChart size={20} className="nav-icon" />
              <span className="nav-text">Chart</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/history"
              className={`nav-link d-flex align-items-center ${
                location.pathname === "/history" ? "active" : ""
              }`}
            >
              <Clock size={20} className="nav-icon" />
              <span className="nav-text">History</span>
            </Link>
          </li>
          <li className="nav-item">
            <Link
              to="/user"
              className={`nav-link d-flex align-items-center ${
                location.pathname === "/user" ? "active" : ""
              }`}
            >
              <User size={20} className="nav-icon" />
              <span className="nav-text">User</span>
            </Link>
          </li>
        </ul>
      </nav>

      <div className="sidebar-footer">
        <button
          onClick={handleLogout}
          className="nav-link d-flex align-items-center w-100 logout-btn"
        >
          <LogOut size={20} className="nav-icon" />
          <span className="nav-text">Logout</span>
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
