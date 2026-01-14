/*
 Main landing page for technicians.
 */

import { Link } from "react-router-dom";
// Link component for navigation

import Header from "../../components/common/Header";
// Header component

// Technician dashboard main page
function TechnicianDashboard() {
  return (
    <>
      {/* Page header */}
      <Header />

      <div className="container">

        {/* Page title */}
        <h2 className="section-title">Technician Dashboard</h2>

        <div className="panel">

          {/* Dashboard cards grid */}
          <div className="dashboard-grid">

            {/* Assigned requests card */}
            <div className="dashboard-card">
              <h4>Assigned Requests</h4>
              <p>Track and manage current requests.</p>

              {/* Requests navigation */}
              <div className="dashboard-actions">
                <Link className="primary" to="/technician/requests">
                  View Requests
                </Link>
              </div>
            </div>

            {/* Availability card */}
            <div className="dashboard-card">
              <h4>Availability</h4>
              <p>Set your working hours for new bookings.</p>

              {/* Availability navigation */}
              <div className="dashboard-actions">
                <Link className="primary" to="/technician/availability">
                  Set Availability
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}

// Export component
export default TechnicianDashboard;
