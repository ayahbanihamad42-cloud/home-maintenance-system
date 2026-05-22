import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/common/Header";

import {
  getMyTechnicianRequests,
  updateTechnicianRequestStatus,
} from "../../services/technicianService";

function TechnicianRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadRequests = async () => {
    try {
      setLoading(true);

      const data = await getMyTechnicianRequests();

      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("technician requests error:", err);

      setMessage({
        type: "error",
        title: "Error",
        body: "Failed to load technician requests.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;

    return requests.filter(
      (req) =>
        String(req.status || "").toLowerCase() ===
        String(statusFilter).toLowerCase()
    );
  }, [requests, statusFilter]);

  const updateStatus = async (requestId, status) => {
    try {
      setMessage(null);

      await updateTechnicianRequestStatus(
        requestId,
        status
      );

      setMessage({
        type: "success",
        title: "Status Updated",
        body: `Request marked as ${status}.`,
      });

      loadRequests();
    } catch (err) {
      console.error("status update error:", err);

      setMessage({
        type: "error",
        title: "Update Failed",
        body:
          err.response?.data?.message ||
          "Failed to update request status.",
      });
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).split("T")[0];
  };

  return (
    <>
      <Header />

      <div className="container">
        <h2>Technician Requests</h2>

        {message && (
          <div className={`message-box-card ${message.type}`}>
            <div className="message-box-title">{message.title}</div>
            <div className="message-box-body">{message.body}</div>
          </div>
        )}

        <div className="tiny-filter-box">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="on_the_way">On The Way</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {loading ? (
          <p>Loading...</p>
        ) : filteredRequests.length === 0 ? (
          <p className="history-empty">No requests found.</p>
        ) : (
          <div className="cards-grid">
            {filteredRequests.map((req) => (
              <div className="card history-card" key={req.id}>
                <div className="history-card-header">
                  <h3>
                    {req.service ||
                      req.service_type ||
                      "Maintenance"}
                  </h3>

                  <span className="status-pill">
                    {req.status}
                  </span>
                </div>

                <div className="history-info-grid">
                  <p>
                    <b>User:</b>{" "}
                    {req.user_name || req.user_id || "-"}
                  </p>

                  <p>
                    <b>Phone:</b>{" "}
                    {req.phone || "-"}
                  </p>

                  <p>
                    <b>Date:</b>{" "}
                    {formatDate(req.scheduled_date)}
                  </p>

                  <p>
                    <b>Time:</b>{" "}
                    {req.scheduled_time || "-"}
                  </p>

                  <p>
                    <b>Created At:</b>{" "}
                    {req.created_at
                      ? new Date(req.created_at).toLocaleString()
                      : "-"}
                  </p>

                  <p>
                    <b>Location:</b>{" "}
                    {req.location_note ||
                      req.location ||
                      req.city ||
                      "-"}
                  </p>

                  <p>
                    <b>Payment:</b>{" "}
                    {req.payment_method || "-"}
                  </p>

                  <p>
                    <b>Total:</b>{" "}
                    {Number(
                      req.total_price || 0
                    ).toFixed(2)}{" "}
                    JOD
                  </p>
                </div>

                <p className="history-description">
                  {req.description}
                </p>

                <div className="technician-card-actions">
                  {req.status === "pending" && (
                    <>
                      <button
                        className="primary"
                        onClick={() =>
                          updateStatus(req.id, "accepted")
                        }
                      >
                        Accept
                      </button>

                      <button
                        className="secondary"
                        onClick={() =>
                          updateStatus(req.id, "rejected")
                        }
                      >
                        Reject
                      </button>
                    </>
                  )}

                  {req.status === "accepted" && (
                    <button
                      className="primary"
                      onClick={() =>
                        updateStatus(req.id, "on_the_way")
                      }
                    >
                      On The Way
                    </button>
                  )}

                  {req.status === "on_the_way" && (
                    <button
                      className="primary"
                      onClick={() =>
                        updateStatus(req.id, "in_progress")
                      }
                    >
                      Start Work
                    </button>
                  )}

                  {req.status === "in_progress" && (
                    <button
                      className="primary"
                      onClick={() =>
                        updateStatus(req.id, "completed")
                      }
                    >
                      Complete
                    </button>
                  )}
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