import React from "react";
import { Link, useNavigate } from "react-router-dom";

function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="navbar">
      <div>
        {user ? (
          <>
            <Link to="/home">Home</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/history">History</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/">Welcome</Link>
          </>
        )}
      </div>
    </div>
  );
}

export default Header;
