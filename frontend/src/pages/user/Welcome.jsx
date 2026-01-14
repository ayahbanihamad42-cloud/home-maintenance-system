// Import React library
import React from "react";

// Import navigation hook from react-router
import { useNavigate } from "react-router-dom";

// Import global styles
import "../../index.css";

// Import welcome image
import welomeimage from "../../images/home.png";

// Welcome page component
function Welcome() {

  // Initialize navigation function
  const navigate = useNavigate();

  return (
    // Main container for welcome page
    <div className="welcome-container">

      // Main welcome title
      <h1 className="welcome-title">Welcome to Home Maintenance System</h1>

      // Subtitle and description text
      <p className="welcome-subtitle">
        Your trusted hub for home maintenance services.
        <br />
        Book reliable technicians, manage requests, and keep your home in great shape.
      </p>

      // Welcome illustration image
      <img className="welcome-image" src={welomeimage} alt="home" />

      // Container for navigation buttons
      <div className="welcome-buttons">

        // Navigate to register page
        <button
          className="btn btn-register"
          onClick={() => navigate("/register")}
        >
          Register
        </button>

        // Navigate to login page
        <button
          className="btn btn-login"
          onClick={() => navigate("/login")}
        >
          Login
        </button>

      </div>
    </div>
  );
}

// Export Welcome component
export default Welcome;
