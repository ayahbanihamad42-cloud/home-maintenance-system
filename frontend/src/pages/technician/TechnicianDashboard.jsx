/*
 Main landing page for technicians.
 */

import { Link } from "react-router-dom";
import Header from "../../components/common/Header";

function TechnicianDashboard() {
  return (
    <>
      <Header />
      <div className="container">
        <h2 className="section-title">Technician Dashboard</h2>

        <div className="panel">
          <div className="dashboard-grid">
            <div className="dashboard-card">
              <h4>Assigned Requests</h4>
              <p>Track and manage current requests.</p>
              <div className="dashboard-actions">
                <Link className="primary" to="/technician/requests">
                  View Requests
                </Link>
              </div>
            </div>

            <div className="dashboard-card">
              <h4>Availability</h4>
              <p>Set your working hours for new bookings.</p>
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

export default TechnicianDashboard;
