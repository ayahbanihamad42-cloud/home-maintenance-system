// React hook for managing state
import { useState } from "react";

// Router utilities
import { useParams, useNavigate, Link } from "react-router-dom";

// Axios API instance
import API from "../../services/api";

// Reset password page component
function ResetPassword() {
  // Get reset token from URL
  const { token } = useParams();

  // Navigation hook
  const navigate = useNavigate();

  // Password input state
  const [password, setPassword] = useState("");

  // Confirm password input state
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback message state
  const [message, setMessage] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  // Submit new password
  const submit = async () => {
    setMessage("");

    if (!password || !confirmPassword) {
      setMessage("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Call backend reset endpoint
      const res = await API.post(`/auth/reset-password/${token}`, { password });

      setMessage(res?.data?.message || "Password updated successfully.");

      // Redirect to login after short delay
      setTimeout(() => navigate("/login"), 900);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        {/* Page title */}
        <h2>Reset Password</h2>

        {/* Page description */}
        <p className="auth-subtitle">
          Enter a new password for your account.
        </p>

        {/* New password input */}
        <div className="input-group">
          <label>New Password</label>
          <input
            type="password"
            placeholder="New password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        {/* Confirm password input */}
        <div className="input-group">
          <label>Confirm Password</label>
          <input
            type="password"
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
        </div>

        {/* Feedback message */}
        {message ? <p className="helper-text">{message}</p> : null}

        {/* Submit button */}
        <button className="primary" onClick={submit} disabled={loading}>
          {loading ? "Updating..." : "Update Password"}
        </button>

        {/* Back to login */}
        <div style={{ marginTop: "10px" }}>
          <Link to="/login">Back to Login</Link>
        </div>
      </div>
    </div>
  );
}

export default ResetPassword;
