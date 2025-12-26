/*
 Main landing page for technicians.
 */

import { Link } from "react-router-dom";

function TechnicianDashboard() {
  return (
    <div className="container">
      <h2>Technician Dashboard</h2>

      <Link className="primary" to="/technician/requests">
        View Requests
      </Link>

      <Link className="primary" to="/technician/availability">
        Set Availability
      </Link>
    </div>
  );
}

export default TechnicianDashboard;
