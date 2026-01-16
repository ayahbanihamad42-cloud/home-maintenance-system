// React hook for managing state
import { useState } from "react";

// Axios API instance
import API from "../../services/api";

// Forgot password page component
function ForgotPassword() {
  // Email input state
  const [email, setEmail] = useState("");

  // Message feedback state
  const [message, setMessage] = useState("");

  // Loading state for submit action
  const [loading, setLoading] = useState(false);

  // Handle submit action
  const submit = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      // Send forgot password request (email only)
      const res = await API.post("/auth/forgotPassword", { email });

      setMessage(res?.data?.message || "Reset link sent to your email.");
      setEmail("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send reset link.");
    } finally {
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
          Enter your email to receive a password reset link.
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

        {/* Feedback message */}
        {message ? <p className="helper-text">{message}</p> : null}

        {/* Submit button */}
        <button className="primary" onClick={submit} disabled={loading}>
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </div>
    </div>
  );
}

export default ForgotPassword;
