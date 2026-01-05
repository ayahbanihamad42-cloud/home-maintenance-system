import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login } from "../../services/auth.service.jsx";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await login({ email, password });
      // كل شيء مخزن في localStorage في auth.service
      navigate("/home"); // path في Router لاحظ حروف صغيرة
    } catch (err) {
  const msg = err.response?.data?.message || "Login failed. Check your credentials.";
  console.error(msg);
  alert(msg);
}

  };

  return (
    <div className="container">
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
      <div>
        <Link to="/register">Don't have an account? Register</Link>
      </div>
      <div>
        <Link to="/forgot-password">Forgot password?</Link>
      </div>
    </div>
  );
}

export default Login;
