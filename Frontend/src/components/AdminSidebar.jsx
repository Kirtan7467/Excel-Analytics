import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Home,
  FileText,
  BarChart,
  User,
  Clock,
  LogOut,
  ShieldCheck,
} from "lucide-react";
import "./Sidebar.css";

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/admin-login");
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <div className="d-flex align-items-center">
          <div className="sidebar-logo">
            <span>EA</span>
          </div>
          <span className="ms-2 h5 mb-0 fw-bold text-light">Admin Panel</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="nav flex-column">
          <li className="nav-item">
            <Link
              to="/admin-dashboard"
              className={`nav-link d-flex align-items-center ${
                location.pathname === "/admin-dashboard" ? "active" : ""
              }`}
            >
              <Home size={20} className="nav-icon" />
              <span className="nav-text">Home</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/admin-files"
              className={`nav-link d-flex align-items-center ${
                location.pathname === "/admin-files" ? "active" : ""
              }`}
            >
              <FileText size={20} className="nav-icon" />
              <span className="nav-text">Files</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/admin-charts"
              className={`nav-link d-flex align-items-center ${
                location.pathname === "/admin-charts" ? "active" : ""
              }`}
            >
              <BarChart size={20} className="nav-icon" />
              <span className="nav-text">Charts</span>
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
              to="/admin-users"
              className={`nav-link d-flex align-items-center ${
                location.pathname === "/admin-users" ? "active" : ""
              }`}
            >
              <User size={20} className="nav-icon" />
              <span className="nav-text">Users</span>
            </Link>
          </li>

          <li className="nav-item">
            <Link
              to="/admin-user-control"
              className={`nav-link d-flex align-items-center ${
                location.pathname === "/admin-user-control" ? "active" : ""
              }`}
            >
              <ShieldCheck size={20} className="nav-icon" />
              <span className="nav-text">User Control</span>
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

export default AdminSidebar;
