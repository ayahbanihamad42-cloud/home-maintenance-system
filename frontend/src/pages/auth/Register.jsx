import React, { useState } from "react";
// React and useState hook

import { useNavigate, Link } from "react-router-dom";
// Navigation and link utilities

import { register } from "../../services/auth.service.jsx";
// Register API service

// Register page component
function Register() {

  // Form state to store user input values
  const [form, setForm] = useState({});

  // Navigation hook
  const navigate = useNavigate();

  // Handle form submission
  const handleSubmit = async (e) => {

    // Prevent page refresh
    e.preventDefault();

    try {
      // Send registration data to API
      await register(form);

      // Redirect to login page after successful registration
      navigate("/login");

    } catch (err) {

      // Extract error message from response or use default
      const msg =
        err.response?.data?.message || "Registration failed.";

      // Log error message
      console.error(msg);

      // Show error alert
      alert(msg);

      // Log submitted form data for debugging
      console.log("Registering user with:", form);

      // Log full error object for debugging
      console.error("Full error object:", err);
    }
  };

  return (
    <div className="container">

      {/* Page title */}
      <h2>Register</h2>

      {/* Registration form */}
      <form onSubmit={handleSubmit}>

        {/* Generate input fields dynamically */}
        {["name", "email", "phone", "dob", "city", "password"].map(f => (

          <div className="input-group" key={f}>

            {/* Field label */}
            <label>{f}</label>

            {/* Input field */}
            <input
              type={
                f === "dob"
                  ? "date"
                  : f === "password"
                  ? "password"
                  : "text"
              }
              onChange={e =>
                setForm({ ...form, [f]: e.target.value })
              }
            />
          </div>
        ))}

        {/* Submit button */}
        <button className="primary">Register</button>
      </form>

      {/* Login page link */}
      <Link to="/login">Already have an account? Login</Link>

    </div>
  );
}

// Export component
export default Register;

