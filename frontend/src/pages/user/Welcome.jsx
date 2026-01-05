import React from "react";
import { useNavigate } from "react-router-dom";
import "../../index.css";
import welomeimage from "../../images/home.png";
function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <h1 className="welcome-title">Welcome</h1>
      <img className="welcome-image" src={welomeimage} alt="home" />
      <div className="welcome-buttons">
        <button className="btn btn-register" onClick={() => navigate("/register")}>Register</button>
        <button className="btn btn-login" onClick={() => navigate("/login")}>Login</button>
      </div>
    </div>
  );
}

export default Welcome;
