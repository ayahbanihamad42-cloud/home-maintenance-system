import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../../services/api";
import welcomeimage from "../../images/home.png";

const jordanCities = [
  "Amman",
  "Irbid",
  "Zarqa",
  "Balqa",
  "Madaba",
  "Karak",
  "Tafilah",
  "Ma'an",
  "Aqaba",
  "Jerash",
  "Ajloun",
  "Mafraq",
];

function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    city: "",
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

      await API.post("/auth/register", form);

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    }
  };

  return (
    <div className="auth-shell">
      <div className="split-card">
        <section className="brand-panel">
          <h1 className="brand-logo-text">خدمة</h1>

          <h2>Create your account.</h2>

          <p>
            Join خدمة to request home maintenance services, choose trusted
            technicians, track requests, chat, pay, and review completed work.
          </p>

          <img className="brand-icon" src={welcomeimage} alt="Khidma" />
        </section>

        <section className="form-panel">
          <h1>Register</h1>
          <p>Create a customer account and start booking services.</p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form two-columns" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>Name</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                required
              />
            </div>

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
              <label>Phone</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="07XXXXXXXX"
                required
              />
            </div>

            <div className="auth-field">
              <label>Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>City</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              >
                <option value="">Select city...</option>
                {jordanCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="auth-field">
              <label>Password</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create password"
                required
              />
            </div>

            <button className="primary full-width" type="submit">
              Register
            </button>
          </form>

          <div className="auth-links">
            <Link to="/login">Already have an account? Login</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;