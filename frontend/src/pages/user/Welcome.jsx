import React from "react";
import { useNavigate } from "react-router-dom";
import welcomeimage from "../../images/home.png"; // عدلي المسار حسب مشروعك

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      {/* Main welcome title */}
      <h1 className="welcome-title">Welcome to Home Maintenance System</h1>

      {/* Subtitle and description text */}
      <p className="welcome-subtitle">
        Your trusted hub for home maintenance services.
        <br />
        Book reliable technicians, manage requests, and keep your home in great shape.
      </p>

      {/* Welcome illustration image */}
      <img className="welcome-image" src={welcomeimage} alt="Welcome" />

      {/* Container for navigation buttons */}
      <div className="welcome-buttons">
        <button className="primary" onClick={() => navigate("/register")}>
          Register
        </button>

        <button className="primary" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>
    </div>
  );
}

export default Welcome;
