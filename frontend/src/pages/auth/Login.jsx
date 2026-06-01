import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import welcomeimage from "../../images/home.png";

function Login() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = String(res.data.user?.role || "").toLowerCase();

      if (role === "admin") navigate("/admin");
      else if (role === "technician") navigate("/technician-dashboard");
      else navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <div className="auth-shell">
      <div className="split-card">
        <section className="brand-panel">
          <h1 className="brand-logo-text">خدمة</h1>

          <h2>Welcome back.</h2>

          <p>
            Sign in to manage your maintenance requests, chat with technicians,
            review services, and continue your bookings.
          </p>

          <img className="brand-icon" src={welcomeimage} alt="Khidma" />
        </section>

        <section className="form-panel">
          <h1>Login</h1>
          <p>Enter your account information to continue.</p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Email</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="example@email.com"
                required
              />
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
              />
            </div>

            <button className="primary" type="submit">
              Login
            </button>
          </form>

          <div className="auth-links">
            <Link to="/register">Don&apos;t have an account? Register</Link>
            <Link to="/forgot-password">Forgot password?</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;