import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../../services/auth.service.jsx";

// Register page component
function Register() {
  // Form state to store user input values
  const [form, setForm] = useState({});

  // Navigation hook
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await register(form);
      navigate("/login");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Registration failed.";
      alert(msg);
      console.error("Register error:", err);
    }
  };

  return (
    <div className="container">
      {/* Page title */}
      <h2>Register</h2>

      {/* Registration form */}
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

      {/* Login page link */}
      <Link to="/login">Already have an account? Login</Link>
    </div>
  );
}

export default Register;
