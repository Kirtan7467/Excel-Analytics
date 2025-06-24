import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./NovaSignup.css";

const NovaSignup = () => {
  const [signupInfo, setSignupInfo] = useState({
    name: "",
    phone: "",
    password: "",
    course: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSignupInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleSignup = async () => {
    setIsLoading(true);
    try {
      console.log("Signing up with:", signupInfo);
      setTimeout(() => setIsLoading(false), 1000);
    } catch (error) {
      console.error("Signup failed:", error);
      setIsLoading(false);
    }
  };
  const handleSendOTP = async () => {
    if (!signupInfo.phone || signupInfo.phone.length !== 10) {
      alert("Please enter a valid 10-digit phone number.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: signupInfo.phone }),
      });

      const data = await response.json();
      if (data.success) {
        alert("OTP sent successfully to " + signupInfo.phone);
      } else {
        alert("Failed to send OTP: " + data.message);
      }
    } catch (error) {
      console.error("Error sending OTP:", error);
      alert("Something went wrong while sending OTP.");
    }
    setIsLoading(false);
  };

  return (
    <div className="signup-container">
      <div className="signup-card-full">
        <h1 className="signup-form-title">Signup</h1>

        <label className="signup-form-label">Course</label>
        <select
          name="course"
          value={signupInfo.course}
          onChange={handleChange}
          className="signup-form-control"
        >
          <option value="">Choose course</option>
          <option value="B.Com">B.Com</option>
          <option value="B.Sc">B.Sc</option>
        </select>

        <label className="signup-form-label">Name</label>
        <input
          type="text"
          name="name"
          value={signupInfo.name}
          onChange={handleChange}
          placeholder="Enter your full name"
          className="signup-form-control"
          autoFocus
        />

        <label className="signup-form-label">Phone Number</label>
        <input
          type="tel"
          name="phone"
          value={signupInfo.phone}
          onChange={(e) => {
            const input = e.target.value.replace(/\D/g, ""); // Remove non-numeric characters
            if (input.length <= 10) {
              setSignupInfo((prev) => ({ ...prev, phone: input }));
            }
          }}
          placeholder="Enter your phone number"
          className="signup-form-control"
          maxLength={10}
        />

        <label className="signup-form-label">Password</label>
        <input
          type={showPassword ? "text" : "password"}
          name="password"
          value={signupInfo.password}
          onChange={handleChange}
          placeholder="Create a password"
          className="signup-form-control"
        />

        <button
          type="button"
          onClick={handleSendOTP}
          className="btn btn-outline-primary w-100 mb-3"
          disabled={isLoading}
        >
          {isLoading ? "Sending OTP..." : "Send OTP"}
        </button>

        <p className="mt-3 text-center text-muted">
          Already have an account?{" "}
          <Link to="/login" className="signup-login-link">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default NovaSignup;
