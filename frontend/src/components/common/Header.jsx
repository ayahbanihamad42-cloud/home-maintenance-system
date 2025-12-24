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
      <div>
        {user ? (
          <>
            <Link to="/home">Home</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/history">History</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        ) : (
          <>Welcome to our Home Maintenance System</>
        )}
      </div>
    </div>
  );
}

export default Header;
