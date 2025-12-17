import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/userService";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = await loginUser({ email, password });
    localStorage.setItem("user", JSON.stringify(user));
    navigate("/home");
  };

  return (
    <div className="container auth-box">
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Email</label>
          <input value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        <div className="input-group">
          <label>Password</label>
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} />
        </div>
        <button className="primary">Login</button>
      </form>
    </div>
  );
}

export default Login;
