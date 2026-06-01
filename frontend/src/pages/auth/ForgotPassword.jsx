import React, { useState } from "react";
import { Link } from "react-router-dom";
import API from "../../services/api";
import welcomeimage from "../../images/home.png";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const res = await API.post("/auth/forgotPassword", { email });

      setMessage(
        res.data?.message ||
          "If this email exists, a password reset link will be sent."
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link.");
    }
  };

  return (
    <div className="auth-shell">
      <div className="split-card">
        <section className="brand-panel">
          <h1 className="brand-logo-text">خدمة</h1>

          <h2>Reset access safely.</h2>

          <p>
            Enter your email address and we will help you recover your account
            securely so you can continue managing your maintenance requests.
          </p>

          <img className="brand-icon" src={welcomeimage} alt="Khidma" />
        </section>

        <section className="form-panel">
          <h1>Forgot Password</h1>
          <p>Enter your email address to receive a reset link.</p>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
              />
            </div>

            <button className="primary" type="submit">
              Send Reset Link
            </button>
          </form>

          <div className="auth-links">
            <Link to="/login">Back to Login</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ForgotPassword;