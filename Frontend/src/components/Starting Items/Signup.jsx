import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom"; // Import useNavigate
import "./Signup.css";

function Signup() {
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const navigate = useNavigate(); // Initialize useNavigate

  const handleSuccess = (msg) => {
    setMessage(msg);
    setMessageType("success");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleError = (msg) => {
    setMessage(msg);
    setMessageType("error");
    setTimeout(() => {
      setMessage("");
      setMessageType("");
    }, 5000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    const { name, email, password } = signupInfo;

    if (!name || !email || !password) {
      return handleError("Name, email, and password are required");
    }

    if (!agreeToTerms) {
      return handleError("Please agree to the Terms & Conditions");
    }

    setIsLoading(true);

    try {
      const url = "http://localhost:8080/auth/signup";
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupInfo),
      });

      const result = await response.json();
      const { success, message, error, token } = result;

      if (!response.ok) {
        console.log("HTTP error:", response.status, result);
        throw new Error(
          `HTTP error! status: ${response.status} - ${
            message || result.message || "Unknown error"
          }`
        );
      }

      if (success) {
        handleSuccess(`${message} (User)`);
        // Store the token in localStorage
        localStorage.setItem("token", token);
        setTimeout(() => {
          console.log("Redirecting to dashboard...");
          navigate("/dashboard"); // Redirect to Dashboard.jsx
        }, 1000);
      } else {
        handleError(message || "Signup failed");
      }
    } catch (err) {
      console.error("Signup error:", err.message);
      if (err.name === "TypeError" && err.message === "Failed to fetch") {
        handleError(
          "Unable to connect to server. Please check your connection."
        );
      } else {
        handleError(err.message || "Something went wrong");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="row g-0 h-100">
        {/* Left Panel - Form */}
        <div className="col-lg-6 signup-left-panel">
          <div className="d-flex align-items-center justify-content-center h-100">
            <div className="signup-form-wrapper">
              {/* Logo */}
              <div className="mb-4">
                <div className="d-flex align-items-center">
                  <div className="signup-logo">
                    <span>EA</span>
                  </div>
                  <span className="ms-2 h4 mb-0 fw-bold text-dark">
                    Excel Analytics
                  </span>
                </div>
              </div>

              {/* Form */}
              <div>
                <h1 className="signup-form-title">Create an account</h1>

                {/* Message Display */}
                {message && (
                  <div
                    className={`alert ${
                      messageType === "success"
                        ? "alert-success"
                        : "alert-danger"
                    } alert-dismissible`}
                  >
                    {message}
                  </div>
                )}

                <div className="mb-3">
                  <label className="form-label signup-form-label">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={signupInfo.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="form-control signup-form-control"
                    autoFocus
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label signup-form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    value={signupInfo.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="form-control signup-form-control"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label signup-form-label">
                    Password
                  </label>
                  <div className="signup-password-container">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={signupInfo.password}
                      onChange={handleChange}
                      placeholder="Enter your password"
                      className="form-control signup-form-control signup-password-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="signup-password-toggle"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="mb-4">
                  <div className="form-check">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      className="form-check-input"
                    />
                    <label htmlFor="terms" className="form-check-label small">
                      I agree to all the Terms & Conditions
                    </label>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSignup}
                  disabled={isLoading}
                  className="btn btn-primary w-100 mb-4 signup-submit-button"
                >
                  {isLoading ? "Creating Account..." : "Sign up"}
                </button>

                <div className="text-center mb-4">
                  <span className="text-muted small">Or</span>
                </div>
                <div className="text-center">
                  <p className="text-muted small">
                    Already have an account?{" "}
                    <Link
                      type="button"
                      to={"/login"}
                      className="btn btn-link p-0 text-decoration-none signup-login-link"
                    >
                      Log in
                    </Link>
                  </p>
                  <p className="text-muted small">
                    Are you a Admin?{" "}
                    <Link
                      to="/admin-signup"
                      className="btn btn-link p-0 text-decoration-none admin-signup-login-link"
                    >
                      Admin Signup
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Analytics Dashboard */}
        <div className="col-lg-6 d-flex align-items-center justify-content-center position-relative signup-right-panel">
          {/* Background Pattern */}
          <div className="signup-background-pattern">
            <div className="signup-pattern-square signup-pattern-square-1"></div>
            <div className="signup-pattern-square signup-pattern-square-2"></div>
            <div className="signup-pattern-square signup-pattern-square-3"></div>
            <div className="signup-pattern-square signup-pattern-square-4"></div>
            <div className="signup-pattern-square signup-pattern-square-5"></div>
          </div>

          {/* Main Content */}
          <div className="text-center position-relative signup-right-content">
            {/* Analytics Card */}
            <div className="signup-analytics-card">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold text-dark mb-0">Analytics</h5>
                <div className="btn-group btn-group-sm">
                  <button className="btn btn-link text-muted small">
                    Weekly
                  </button>
                  <button className="btn btn-link text-muted small">
                    Monthly
                  </button>
                  <button className="btn btn-link small signup-active-tab">
                    Yearly
                  </button>
                </div>
              </div>

              <div className="signup-chart-container">
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
            <div className="signup-analytics-card">
              <div className="d-flex justify-content-center">
                <div className="signup-progress-circle">
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
                  <div className="position-absolute top-50 start-50 translate-middle text-center signup-progress-text">
                    <div className="small fw-medium text-dark">Total</div>
                    <div className="signup-progress-value">42%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Text Content */}
            <div className="text-white signup-right-text">
              <h2 className="fw-bold mb-3 signup-right-title">
                Very simple way you can engage
              </h2>
              <p className="signup-right-description">
                Welcome to (DAILY) Inventory Management System! Efficiently
                track and manage your inventory with ease.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Signup;
