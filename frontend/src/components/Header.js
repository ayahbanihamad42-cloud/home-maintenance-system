<<<<<<< Updated upstream
=======
import { Link } from "react-router-dom";

const Header = () => {
  const role = "user"; // لاحقًا من auth

  return (
    <header className="header">
      <h2>Maintenance Platform</h2>

      <nav>
        {role === "user" && (
          <>
            <Link to="/home">Services</Link>
            <Link to="/requests">Requests</Link>
            <Link to="/history">History</Link>
            <Link to="/profile">Profile</Link>
            <Link to="/">Logout</Link>
          </>
        )}

        {role === "admin" && (
          <Link to="/admin">Dashboard</Link>
        )}

        {!role && (
          <>
            <Link to="/">Welcome</Link>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </>
        )}
      </nav>
    </header>
  );
};

export default Header;
>>>>>>> Stashed changes
