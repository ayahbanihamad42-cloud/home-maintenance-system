import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/auth.service.jsx";
import { Link } from "react-router-dom";
function Register() {
  const [form, setForm] = useState({});
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    await register(form);
    navigate("/login");
  };

  return (
    <div className="container ">
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        {["name","email","phone","dob","city","password"].map(f => (
          <div className="input-group" key={f}>
            <label>{f}</label>
            <input
              type={f === "dob" ? "date" : f === "password" ? "password" : "text"} 
              onChange={e => setForm({ ...form, [f]: e.target.value })}
            />
          </div>
        ))}
        <button className="primary">Register</button>
      </form>
      <Link to="/login">
       Already have an account? Login
      </Link>
    </div>
  );
}

export default Register;
