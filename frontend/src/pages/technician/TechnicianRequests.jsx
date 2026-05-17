import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/common/Header";
import { getTechnicianByUserId } from "../../services/technicianService";
import API from "../../services/api";

function TechnicianRequests() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const tech = await getTechnicianByUserId(user.id);
        const res = await API.get(`/technicians/${tech.technicianId}/requests`);
        setRequests(res.data || []);
      } catch (err) {
        console.error("technician requests error:", err);
        setRequests([]);
      }
    };

    loadRequests();
  }, [user.id]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;

    return requests.filter(
      (req) =>
        String(req.status || "").toLowerCase() ===
        String(statusFilter).toLowerCase()
    );
  }, [requests, statusFilter]);

  return (
    <>
      <Header />

      <div className="container">
        <h2 className="section-title">Technician Requests</h2>

        <div className="filter-panel">
          <div className="input-group">
            <label>Filter by request status</label>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All requests</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {filteredRequests.length === 0 ? (
          <div className="empty-gallery-card">No requests found.</div>
        ) : (
          <div className="history-list">
            {filteredRequests.map((req) => (
              <div className="history-card" key={req.id}>
                <h3>{req.service}</h3>

                <p>{req.description}</p>

                <div className="tech-info-list">
                  <span>Status: {req.status}</span>
                  <span>Date: {req.scheduled_date}</span>
                  <span>Time: {req.scheduled_time}</span>
                  <span>User ID: {req.user_id}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default TechnicianRequests;