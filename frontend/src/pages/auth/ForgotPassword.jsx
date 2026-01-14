/*
  Sends a reset link or updates user password when they cannot access their account.
 */


  import { useState } from "react";
// React hook for managing state

import API from "../../services/api";
// Axios API instance

// Forgot password page component
function ForgotPassword() {

  // Email input state
  const [email, setEmail] = useState("");

  // New password input state
  const [password, setPassword] = useState("");

  // Confirm password input state
  const [confirmPassword, setConfirmPassword] = useState("");

  // Message feedback state
  const [message, setMessage] = useState("");

  // Loading state for submit action
  const [loading, setLoading] = useState(false);

  // Handle submit action
  const submit = async () => {

    // Validate email input
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    // Validate password fields if provided
    if (password || confirmPassword) {

      // Check minimum password length
      if (password.length < 6) {
        setMessage("Password must be at least 6 characters.");
        return;
      }

      // Check password match
      if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }
    }

    try {
      // Enable loading state
      setLoading(true);

      // Send forgot password request
      await API.post("/auth/forgotPassword", {
        email,
        ...(password ? { password } : {}),
      });

      // Handle successful password update
      if (password) {
        setMessage("Password updated successfully. You can now log in.");
        setPassword("");
        setConfirmPassword("");
      } 
      // Handle reset link sent
      else {
        setMessage("Reset link sent to your email.");
      }

    } catch (error) {
      // Handle API error response
      setMessage(error.response?.data?.message || "Failed to process request.");
    } finally {
      // Disable loading state
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">

        {/* Page title */}
        <h2>Forgot Password</h2>

        {/* Page description */}
        <p className="auth-subtitle">
          Enter your email to receive a reset link or set a new password below.
        </p>

        {/* Email input */}
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>

        {/* New password input */}
        <div className="input-group">
          <label>New Password</label>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>

        {/* Confirm password input */}
        <div className="input-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>

        {/* Feedback message */}
        {message ? <p className="helper-text">{message}</p> : null}

        {/* Submit button */}
        <button className="primary" onClick={submit} disabled={loading}>
          {loading ? "Sending..." : "Submit"}
        </button>

      </div>
    </div>
  );
}

// Export component
export default ForgotPassword;
