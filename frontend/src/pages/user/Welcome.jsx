import React from "react";
import { useNavigate } from "react-router-dom";
import welcomeimage from "../../images/home.png";

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-shell">
      <div className="split-card">
        <section className="brand-panel">
          <h1 className="brand-logo-text">خدمة</h1>

          <h2>Home services made simple.</h2>

          <p>
            Book trusted technicians, manage requests, chat instantly, use AI
            assistance, and track your maintenance service from one modern platform.
          </p>

          <div className="welcome-actions">
            <button className="primary" onClick={() => navigate("/register")}>
              Register
            </button>

            <button className="outline-btn" onClick={() => navigate("/login")}>
              Login
            </button>
          </div>
        </section>

        <section className="form-panel welcome-right-panel">
          <img className="brand-icon" src={welcomeimage} alt="Khidma" />

          <h1>خدمة بيتك بسهولة وموثوقية</h1>

          <p>
            A smart web and mobile platform for booking reliable home maintenance
            technicians in a simple and modern way.
          </p>
        </section>
      </div>
    </div>
  );
}

export default Welcome;