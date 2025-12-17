import React from "react";
import { useNavigate } from "react-router-dom";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="container welcome">
      <h1>Welcome</h1>
      <img src="C:\Users\pc\Downloads\home-maintenance-system\home-maintenance-system\frontend\src\home.png"></img>
      <button className="primary" onClick={() => navigate("/register")}>Register</button>
      <button className="secondary" onClick={() => navigate("/login")}>Login</button>
    </div>
   
);
}

export default Welcome;
