import React from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "./Sidebar";
import AdminSidebar from "./AdminSidebar";
import { User as UserIcon } from "lucide-react";
import "./User.css";

function User() {
  const userName = localStorage.getItem("userName") || "User";
  const userEmail = localStorage.getItem("userEmail") || "Email not available";
  const role = localStorage.getItem("userRole") || "user";

  const SidebarComponent = role === "admin" ? AdminSidebar : Sidebar;

  return (
    <div style={{ height: "100vh", display: "flex" }}>
      {/* Sidebar based on role */}
      <SidebarComponent />

      {/* Main Content Area */}
      <div className="user-content">
        <h1 className="user-title">
          {role === "admin" ? "Admin" : "User"} Profile
        </h1>

        <div className="user-card">
          <div className="user-header">
            <UserIcon size={60} className="user-icon" />
            <h2 className="user-name">{userName}</h2>
          </div>
          <div className="user-details">
            <div className="detail-item">
              <span className="detail-label">Email:</span>
              <span className="detail-value">{userEmail}</span>
            </div>
            <div className="detail-item">
              <span className="detail-label">Role:</span>
              <span className="detail-value">{role}</span>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}

export default User;
