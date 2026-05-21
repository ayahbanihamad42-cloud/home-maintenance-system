import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/common/Header";
import {
  getMyTechnicianRequests,
  updateTechnicianRequestStatus,
} from "../../services/technicianService";

function formatDate(value) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString();
}

function normalizeStatus(status) {
  return String(status || "").toLowerCase().trim();
}

function statusLabel(status) {
  const value = normalizeStatus(status);

  if (value === "pending") return "Pending";
  if (value === "accepted") return "Accepted";
  if (value === "on_the_way") return "On The Way";
  if (value === "in_progress") return "In Progress";
  if (value === "completed") return "Completed";
  if (value === "rejected") return "Rejected";
  if (value === "cancelled") return "Cancelled";

  return status || "-";
}

function TechnicianRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const loadRequests = async () => {
    try {
      setMessage("");

      const data = await getMyTechnicianRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("technician requests error:", err?.response?.data || err.message);
      setRequests([]);
      setMessage(err?.response?.data?.message || "Failed to load requests.");
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;

    return requests.filter(
      (req) => normalizeStatus(req.status) === normalizeStatus(statusFilter)
    );
  }, [requests, statusFilter]);

  const getAvailableActions = (status) => {
    const current = normalizeStatus(status);

    if (current === "pending") {
      return [
        { label: "Accept", value: "accepted" },
        { label: "Reject", value: "rejected", danger: true },
      ];
    }

    if (current === "accepted") {
      return [{ label: "On The Way", value: "on_the_way" }];
    }

    if (current === "on_the_way") {
      return [{ label: "Start Work", value: "in_progress" }];
    }

    if (current === "in_progress") {
      return [{ label: "Complete", value: "completed" }];
    }

    return [];
  };

  const changeStatus = async (requestId, nextStatus) => {
    try {
      setUpdatingId(requestId);
      setMessage("");

      await updateTechnicianRequestStatus(requestId, nextStatus);

      setRequests((prev) =>
        prev.map((req) =>
          Number(req.id) === Number(requestId)
            ? { ...req, status: nextStatus }
            : req
        )
      );
    } catch (err) {
      console.error("update request status error:", err?.response?.data || err.message);
      setMessage(err?.response?.data?.message || "Failed to update request status.");
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <>
      <Header />

      <div className="container">
        <h2 className="section-title">Technician Requests</h2>

        {message ? <div className="mini-error">{message}</div> : null}

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
              <option value="on_the_way">On The Way</option>
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
          <div
            className="history-list"
            style={{
              display: "grid",
              gap: 16,
              marginTop: 18,
            }}
          >
            {filteredRequests.map((req) => {
              const actions = getAvailableActions(req.status);

              return (
                <div
                  className="history-card"
                  key={req.id}
                  style={{
                    background: "#fff9f3",
                    border: "1px solid #d8c8b8",
                    borderRadius: 18,
                    padding: 18,
                    boxShadow: "0 10px 20px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      gap: 12,
                      marginBottom: 10,
                    }}
                  >
                    <h3 style={{ margin: 0 }}>{req.service || "Service"}</h3>

                    <span
                      style={{
                        background: "#111",
                        color: "#fff",
                        padding: "6px 12px",
                        borderRadius: 999,
                        fontWeight: 800,
                        fontSize: 13,
                      }}
                    >
                      {statusLabel(req.status)}
                    </span>
                  </div>

                  <p style={{ color: "#3a3028", marginBottom: 12 }}>
                    {req.description || "No description"}
                  </p>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                      gap: 8,
                      color: "#3a3028",
                      marginBottom: 14,
                    }}
                  >
                    <span>
                      <b>Date:</b> {formatDate(req.scheduled_date)}
                    </span>

                    <span>
                      <b>Time:</b> {req.scheduled_time || "-"}
                    </span>

                    <span>
                      <b>User:</b> {req.user_name || req.user_id || "-"}
                    </span>

                    <span>
                      <b>Phone:</b> {req.user_phone || "-"}
                    </span>

                    <span>
                      <b>Location:</b> {req.location_note || req.city || "-"}
                    </span>

                    <span>
                      <b>Payment:</b> {req.payment_method || "-"}
                    </span>

                    <span>
                      <b>Total:</b>{" "}
                      {req.total_price
                        ? `${Number(req.total_price).toFixed(2)} JOD`
                        : "-"}
                    </span>
                  </div>

                  {actions.length > 0 ? (
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        flexWrap: "wrap",
                      }}
                    >
                      {actions.map((action) => (
                        <button
                          key={action.value}
                          type="button"
                          className={
                            action.danger ? "btn-outline" : "primary"
                          }
                          disabled={updatingId === req.id}
                          onClick={() => changeStatus(req.id, action.value)}
                        >
                          {updatingId === req.id ? "Updating..." : action.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div style={{ color: "#6f6257", fontWeight: 700 }}>
                      No actions available for this status.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default TechnicianRequests;