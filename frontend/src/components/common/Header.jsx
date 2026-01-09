import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="navbar">
      <div className="navbar-brand">Maintenance System</div>
      {user ? (
        <>
          <div className="navbar-links">
            <Link to="/home">Home</Link>
            <Link to="/history">Requests History</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/ai-chat">AI Assistant</Link>
          </div>
          <div className="navbar-actions">
            <button className="icon-button" type="button" aria-label="Notifications">
              🔔
            </button>
            <button className="logout-btn" onClick={handleLogout}>Log Out</button>
          </div>
        </>
      ) : (
        <div className="navbar-links">Welcome to our Home Maintenance System</div>
      )}
    </div>
  );
}

export default Header;
