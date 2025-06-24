import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AdminLogin.css";

function AdminLogin() {
  const [loginInfo, setLoginInfo] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();

  const handleSuccess = (msg) => {
    toast.success(msg, {
      position: "top-right",
    });
  };

  const handleError = (msg) => {
    toast.error(msg, {
      position: "top-right",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLoginInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { email, password } = loginInfo;

    if (!email || !password) {
      return handleError("Email and password are required");
    }

    setIsLoading(true);

    try {
      const url = "http://localhost:8080/auth/admin-login";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginInfo),
      });

      const result = await response.json();
      console.log("Login response:", result);

      const { success, message, error, token, name } = result;

      if (success) {
        handleSuccess(`${message} (Admin)`);
        localStorage.setItem("token", token);
        localStorage.setItem("userRole", "admin"); // or "user" for normal users
        localStorage.setItem("userName", name || "User");
        localStorage.setItem("userEmail", email || "Email");
        setTimeout(() => {
          navigate("/admin-dashboard");
        }, 1000);
      } else if (error) {
        const details = error?.details[0]?.message || "Validation error";
        handleError(details);
      } else if (!success) {
        if (message === "Admin use adminlogin") {
          handleError("Please use the admin login endpoint. Try again.");
        } else {
          handleError(message || "Login failed");
        }
      }
    } catch (err) {
      handleError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="row g-0 h-100">
        {/* Left Panel - Form */}
        <div className="col-lg-6 login-left-panel">
          <div className="d-flex align-items-center justify-content-center h-100">
            <div className="login-form-wrapper">
              {/* Logo */}
              <div className="mb-4">
                <div className="d-flex align-items-center">
                  <div className="login-logo">
                    <span>EA</span>
                  </div>
                  <span className="ms-2 h4 mb-0 fw-bold text-dark">
                    Excel Analytics
                  </span>
                </div>
              </div>

              {/* Form */}
              <div>
                <h1 className="login-form-title">
                  Login to your admin account
                </h1>

                <form onSubmit={handleLogin}>
                  <div className="mb-3">
                    <label className="form-label login-form-label">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={loginInfo.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      className="form-control login-form-control"
                      autoFocus
                    />
                  </div>

                  <div className="mb-3">
                    <label className="form-label login-form-label">
                      Password
                    </label>
                    <div className="login-password-container">
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={loginInfo.password}
                        onChange={handleChange}
                        placeholder="Enter your password"
                        className="form-control login-form-control login-password-input"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="login-password-toggle"
                      >
                        {showPassword ? (
                          <EyeOff size={20} />
                        ) : (
                          <Eye size={20} />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        id="rememberMe"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="form-check-input"
                      />
                      <label
                        htmlFor="rememberMe"
                        className="form-check-label small"
                      >
                        Remember Me
                      </label>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="btn btn-primary w-100 mb-4 login-submit-button"
                  >
                    {isLoading ? "Logging In..." : "Login"}
                  </button>

                  <div className="text-center mb-4">
                    <span className="text-muted small">Or</span>
                  </div>
                  <div className="text-center">
                    <p className="text-muted small">
                      Don’t have an account?{" "}
                      <Link
                        to="/admin-signup"
                        className="btn btn-link p-0 text-decoration-none login-signup-link"
                      >
                        Sign up
                      </Link>
                    </p>
                    <p className="text-muted small">
                      Are you a User?{" "}
                      <Link
                        to="/login"
                        className="btn btn-link p-0 text-decoration-none login-signup-link"
                      >
                        User Login
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Analytics Dashboard */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center position-relative login-right-panel">
          {/* Background Pattern */}
          <div className="login-background-pattern">
            <div className="login-pattern-square login-pattern-square-1"></div>
            <div className="login-pattern-square login-pattern-square-2"></div>
            <div className="login-pattern-square login-pattern-square-3"></div>
            <div className="login-pattern-square login-pattern-square-4"></div>
            <div className="login-pattern-square login-pattern-square-5"></div>
          </div>

          {/* Main Content */}
          <div className="text-center position-relative login-right-content">
            {/* Analytics Card */}
            <div className="login-analytics-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold text-dark mb-0">Analytics</h5>
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-link text-muted small">
                    Weekly
                  </button>
                  <button className="btn btn-link text-muted small">
                    Monthly
                  </button>
                  <button className="btn btn-link small login-active-tab">
                    Yearly
                  </button>
                </div>
              </div>

              <div className="login-chart-container">
                <svg width="100%" height="100%" viewBox="0 0 300 100">
                  <polyline
                    fill="none"
                    stroke="#64748b"
                    strokeWidth="2"
                    points="10,80 50,60 90,70 130,40 170,50 210,30 250,45 290,25"
                  />
                  <polyline
                    fill="none"
                    stroke="#0d7377"
                    strokeWidth="2"
                    points="10,90 50,75 90,85 130,55 170,65 210,45 250,60 290,40"
                  />
                </svg>
              </div>

              <div className="d-flex justify-content-between small text-muted">
                <span>MON</span>
                <span>TUE</span>
                <span>WED</span>
                <span>THU</span>
              </div>
            </div>

            {/* Progress Card */}
            <div className="login-analytics-card">
              <div className="d-flex justify-content-center">
                <div className="login-progress-circle">
                  <svg
                    width="80"
                    height="80"
                    style={{ transform: "rotate(-90deg)" }}
                    viewBox="0 0 100 100"
                  >
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#e9ecef"
                      strokeWidth="8"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#0d7377"
                      strokeWidth="8"
                      fill="none"
                      strokeDasharray="100 150"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="position-absolute top-50 start-50 translate-middle text-center login-progress-text">
                    <div className="small fw-medium text-dark">Total</div>
                    <div className="login-progress-value">42%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-white login-right-text">
              <h2 className="fw-bold mb-3 login-right-title">
                Very simple way you can engage
              </h2>
              <p className="login-right-description">
                Welcome to (Excel) Inventory Management System! Efficiently
                track and manage your inventory with ease.
              </p>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}

export default AdminLogin;
