import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/userService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await loginUser({ email, password });
      localStorage.setItem("user", JSON.stringify(user));
      navigate("/home");
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email:</label>
          <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Password:</label>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
        </div>
        <button className="primary" type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
