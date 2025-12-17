import React from "react";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to Maintenance App</h1>
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => navigate("/register")}>Register</button>
        <button type="secondary" onClick={() => navigate("/login")}>Login</button>
      </div>
    </div>
  );
}

export default Welcome;
