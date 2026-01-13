/*
  Sends a reset link or updates user password when they cannot access their account.
 */

import { useState } from "react";
import API from "../../services/api";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    if (password || confirmPassword) {
      if (password.length < 6) {
        setMessage("Password must be at least 6 characters.");
        return;
      }
      if (password !== confirmPassword) {
        setMessage("Passwords do not match.");
        return;
      }
    }

    try {
      setLoading(true);
      await API.post("/auth/forgotPassword", {
        email,
        ...(password ? { password } : {})
      });
      if (password) {
        setMessage("Password updated successfully. You can now log in.");
        setPassword("");
        setConfirmPassword("");
      } else {
        setMessage("Reset link sent to your email.");
      }
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to process request.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2>Forgot Password</h2>
        <p className="auth-subtitle">Enter your email to receive a reset link or set a new password below.</p>
        <div className="input-group">
          <label>Email</label>
          <input
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </div>
        <div className="input-group">
          <label>New Password</label>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </div>
        <div className="input-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        {message ? <p className="helper-text">{message}</p> : null}
        <button className="primary" onClick={submit} disabled={loading}>
          {loading ? "Sending..." : "Submit"}
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
