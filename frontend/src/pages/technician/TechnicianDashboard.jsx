import { Link } from "react-router-dom";
import Header from "../../components/common/Header";

function TechnicianDashboard() {
  return (
    <>
      <Header />

      <main className="dashboard-container technician-dashboard">
        <section className="page-hero">
          <h1>Technician Dashboard</h1>
          <p>Manage requests, availability, and work gallery from one place.</p>
        </section>

        <section className="dashboard-grid">
          <article className="dashboard-card">
            <div className="dashboard-icon">📋</div>
            <div>
              <h3>Assigned Requests</h3>
              <p>Track and manage current maintenance requests.</p>
              <Link className="primary dashboard-link" to="/technician/requests">
                View Requests
              </Link>
            </div>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-icon">🕒</div>
            <div>
              <h3>Availability</h3>
              <p>Set one-time availability and regular monthly schedules.</p>
              <Link className="primary dashboard-link" to="/technician/availability">
                Set Availability
              </Link>
            </div>
          </article>

          <article className="dashboard-card">
            <div className="dashboard-icon">🖼️</div>
            <div>
              <h3>Work Gallery</h3>
              <p>Add work posts and show completed jobs to customers.</p>
              <Link className="primary dashboard-link" to="/profile">
                Manage Gallery
              </Link>
            </div>
          </article>
        </section>
      </main>
    </>
  );
}

export default TechnicianDashboard;