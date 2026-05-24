import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/common/Header";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

function MaintenanceHistory() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setError("");

        const res = await API.get(`/maintenance/user/${user.id}`);
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.error("history error:", err);
        setError(err.response?.data?.message || "Failed to load history.");
        setRequests([]);
      }
    };

    if (user?.id) loadHistory();
  }, [user?.id]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;

    return requests.filter(
      (req) =>
        String(req.status || "").toLowerCase() ===
        String(statusFilter).toLowerCase()
    );
  }, [requests, statusFilter]);

  const formatDate = (value) => {
  if (!value) return "-";

  const raw = String(value).trim();

  if (raw.includes("T")) {
    const d = new Date(raw);
    if (!Number.isNaN(d.getTime())) {
      d.setUTCDate(d.getUTCDate() + 1);
      return d.toISOString().slice(0, 10);
    }
  }

  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  return raw.slice(0, 10);
};

  const statusText = (status) => {
    const value = String(status || "pending").toLowerCase();

    if (value === "on_the_way") return "On The Way";
    if (value === "in_progress") return "In Progress";

    return value.charAt(0).toUpperCase() + value.slice(1);
  };

  return (
    <>
      <Header />

      <div className="container">
        <h2 className="section-title">Maintenance History</h2>

        {error && <div className="error-box">{error}</div>}

        <div className="input-group">
          <label>Filter By Request Status</label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All requests</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="on_the_way">On The Way</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="empty-gallery-card">No requests found.</div>
        ) : (
          <div className="history-list">
            {filteredRequests.map((req) => (
              <div key={req.id} className="history-card">
                <div className="history-card-header">
                  <h3>{req.service || req.service_type || "Maintenance"}</h3>

                  <span className="status-pill">{statusText(req.status)}</span>
                </div>

                <p className="history-description">
                  {req.description || "No description"}
                </p>

                <div className="history-info-grid">
                  <div>
                    <b>Date:</b> {formatDate(req.scheduled_date)}
                  </div>

                  <div>
                    <b>Time:</b> {req.scheduled_time || "-"}
                  </div>

                  <div>
                    <b>Technician:</b>{" "}
                    {req.technician_name ||
                      req.technicianId ||
                      req.technician_id ||
                      "-"}
                  </div>

                  <div>
                    <b>Location:</b>{" "}
                    {req.location_note || req.location || req.city || "-"}
                  </div>
                </div>

                <button
                  type="button"
                  className="primary-btn review-btn"
                  onClick={() => navigate(`/review/${req.id}`)}
                >
                  Review
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default MaintenanceHistory;