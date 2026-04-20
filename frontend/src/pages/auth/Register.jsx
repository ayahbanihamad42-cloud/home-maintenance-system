import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/auth.service.jsx";

function Register() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      alert(msg);
      console.error("Register error:", err);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h2 className="auth-title">Register</h2>

        <form onSubmit={handleSubmit}>
          {["name", "email", "phone", "dob", "city", "password"].map((f) => (
            <div className="input-group" key={f}>
              <label>{f}</label>
              <input
                type={
                  f === "dob"
                    ? "date"
                    : f === "password"
                    ? "password"
                    : "text"
                }
                onChange={(e) =>
                  setForm({ ...form, [f]: e.target.value })
                }
              />
            </div>
          ))}

          <button className="primary">Register</button>
        </form>

        <div>
          <Link to="/login">Already have an account? Login</Link>
        </div>
      </div>
    </div>
  );
}

export default Register;