import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Start.css";
import img from "./image1.jpg";
function Start() {
  const [role, setRole] = useState(null);

  const handleRoleSelect = (selectedRole) => {
    setRole(selectedRole);
  };

  return (
    <div className="start-container">
      <div className="row g-0 h-100">
        {/* Left Panel - Role Selection */}
        <div className="col-lg-6 start-left-panel">
          <div className="d-flex align-items-center justify-content-center h-100">
            <div className="start-form-wrapper">
              {/* Logo */}
              <div className="mb-4">
                <div className="d-flex align-items-center">
                  <img
                    src={img}
                    alt=""
                    style={{
                      height: "50px",
                      width: "50px",
                      borderRadius: "50%",
                      zoom: "100%",
                    }}
                  />
                  <span className="ms-2 h4 mb-0 fw-bold text-dark">
                    Code Crafter
                  </span>
                </div>
              </div>

              {/* Role Selection */}
              <div>
                <h1 className="start-form-title">Welcome to Excel Analitics</h1>
                <p className="start-form-subtitle">
                  Please select your role to continue:
                </p>
                <div className="start-role-cards">
                  <div
                    className="start-role-card start-admin-card"
                    onClick={() => handleRoleSelect("admin")}
                    role="button"
                    tabIndex="0"
                  >
                    <div className="start-role-card-content">
                      <h3>Admin</h3>
                      <p>Manage the system</p>
                      <div className="start-role-card-icon">👤</div>
                    </div>
                  </div>
                  <div
                    className="start-role-card start-user-card"
                    onClick={() => handleRoleSelect("user")}
                    role="button"
                    tabIndex="0"
                  >
                    <div className="start-role-card-content">
                      <h3>Users</h3>
                      <p>Access your account</p>
                      <div className="start-role-card-icon">👥</div>
                    </div>
                  </div>
                </div>

                {role === "admin" && (
                  <div className="start-role-links">
                    <h2 className="start-role-links-title">Admin Actions</h2>
                    <div className="start-action-buttons">
                      <Link
                        to="/admin-signup"
                        className="btn btn-primary w-100 mb-2 start-action-button"
                      >
                        Admin Signup
                      </Link>
                      <Link
                        to="/admin-login"
                        className="btn btn-primary w-100 start-action-button"
                      >
                        Admin Login
                      </Link>
                    </div>
                  </div>
                )}

                {role === "user" && (
                  <div className="start-role-links">
                    <h2 className="start-role-links-title">User Actions</h2>
                    <div className="start-action-buttons">
                      <Link
                        to="/signup"
                        className="btn btn-primary w-100 mb-2 start-action-button"
                      >
                        User Signup
                      </Link>
                      <Link
                        to="/login"
                        className="btn btn-primary w-100 start-action-button"
                      >
                        User Login
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Analytics Dashboard with Logo */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center position-relative start-right-panel">
          {/* Background Pattern */}
          <div className="start-background-pattern">
            <div className="start-pattern-square start-pattern-square-1"></div>
            <div className="start-pattern-square start-pattern-square-2"></div>
            <div className="start-pattern-square start-pattern-square-3"></div>
            <div className="start-pattern-square start-pattern-square-4"></div>
            <div className="start-pattern-square start-pattern-square-5"></div>
          </div>

          {/* Main Content */}
          <div className="text-center position-relative start-right-content">
            {/* Right Panel Logo */}
            <div className="start-right-logo-wrapper mb-4">
              <div className="start-right-logo">
                <img src={img} alt="image" className="profile-img-circle" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Start;
