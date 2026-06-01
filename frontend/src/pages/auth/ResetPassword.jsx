import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import API from "../../services/api";
import welcomeimage from "../../images/home.png";

function ResetPassword() {
  const navigate = useNavigate();
  const { token } = useParams();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setMessage("");

      const res = await API.post(`/auth/reset-password/${token}`, {
        password: form.password,
      });

      setMessage(res.data?.message || "Password reset successfully.");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <div className="auth-shell">
      <div className="split-card">
        <section className="brand-panel">
          <h1 className="brand-logo-text">خدمة</h1>

          <h2>Create a new password.</h2>

          <p>
            Choose a new secure password to protect your account and continue
            using your home maintenance services safely.
          </p>

          <img className="brand-icon" src={welcomeimage} alt="Khidma" />
        </section>

        <section className="form-panel">
          <h1>Reset Password</h1>
          <p>Enter and confirm your new password.</p>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>New Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter new password"
                required
              />
            </div>

            <div className="auth-field">
              <label>Confirm Password</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm new password"
                required
              />
            </div>

            <button className="primary" type="submit">
              Reset Password
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

export default ResetPassword;