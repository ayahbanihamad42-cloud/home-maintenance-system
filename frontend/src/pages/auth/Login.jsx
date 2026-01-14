import React, { useState } from "react";
// React and useState hook

import { useNavigate, Link } from "react-router-dom";
// Navigation and link components from React Router

import { login } from "../../services/auth.service.jsx";
// Login service function

import welomeimage from "../../images/home.png";
// Illustration image

// Login page component
function Login() {

  // Email input state
  const [email, setEmail] = useState("");

  // Password input state
  const [password, setPassword] = useState("");

  // Success message state
  const [successMessage, setSuccessMessage] = useState("");

  // Navigation hook
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {

    // Prevent page reload
    e.preventDefault();

    try {
      // Call login API
      await login({ email, password });

      // Show success message
      setSuccessMessage("Login successful. Redirecting...");

      // Redirect user to home page after delay
      setTimeout(() => {
        navigate("/home");
      }, 900);

    } catch (err) {
      // Get error message from response or fallback
      const msg =
        err.response?.data?.message ||
        "Login failed. Check your credentials.";

      // Log error for debugging
      console.error(msg);

      // Show error alert
      alert(msg);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Page title */}
        <h2 className="auth-title">Welcome back</h2>

        {/* Page subtitle */}
        <p className="auth-subtitle">
          Sign in to manage your maintenance requests.
        </p>

        {/* Success message */}
        {successMessage ? (
          <p className="auth-success">{successMessage}</p>
        ) : null}

        {/* Login form */}
        <form onSubmit={handleSubmit}>

          {/* Email input */}
          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
            />
          </div>

          {/* Password input */}
          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter your password"
            />
          </div>

          {/* Submit button */}
          <button className="primary">Login</button>
        </form>

        {/* Illustration image */}
        <img
          className="auth-illustration"
          src={welomeimage}
          alt="Home maintenance"
        />

        {/* Additional message */}
        <p className="auth-message">
          We’re ready to help you keep your home running smoothly.
        </p>

        {/* Register link */}
        <div>
          <Link to="/register">Don't have an account? Register</Link>
        </div>

        {/* Forgot password link */}
        <div>
          <Link to="/forgot-password">Forgot password?</Link>
        </div>

      </div>
    </div>
  );
}

// Export component
export default Login;

