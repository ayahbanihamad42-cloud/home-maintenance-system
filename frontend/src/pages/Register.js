import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/userService";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [city, setCity] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await registerUser({ name, email, phone, dob, city, password });
      alert("Registration successful");
      navigate("/login");
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Name:</label>
          <input value={name} onChange={e=>setName(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Email:</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Phone:</label>
          <input value={phone} onChange={e=>setPhone(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Date of Birth:</label>
          <input type="date" value={dob} onChange={e=>setDob(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>City:</label>
          <input value={city} onChange={e=>setCity(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Password:</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button className="primary" type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
