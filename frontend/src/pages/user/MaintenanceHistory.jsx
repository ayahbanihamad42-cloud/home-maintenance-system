import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/common/Header";
import API from "../../services/api";
import { useNavigate } from "react-router-dom";

function MaintenanceHistory() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [error, setError] = useState("");

  const formatDateOnly = (value) => {
    if (!value) return "-";
    return String(value).slice(0, 10);
  };

  const formatTimeOnly = (value) => {
    if (!value) return "-";
    return String(value).slice(0, 8);
  };

  useEffect(() => {
    const loadHistory = async () => {
      try {
        setError("");
        const res = await API.get(`/maintenance/user/${user.id}`);
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load history.");
        setRequests([]);
      }
    };

    if (user?.id) loadHistory();
  }, [user?.id]);

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (statusFilter !== "all") {
      result = result.filter(
        (r) => String(r.status || "").toLowerCase() === statusFilter
      );
    }

    if (dateFilter) {
      result = result.filter((r) => formatDateOnly(r.scheduled_date) === dateFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((r) =>
        [
          r.service,
          r.description,
          r.status,
          r.city,
          r.technician_name,
          r.location_note,
          r.payment_method,
        ]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    return result.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
  }, [requests, statusFilter, search, dateFilter]);

  return (
    <>
      <Header />

      <main className="history-container">
        <section className="page-hero">
          <h1>Maintenance History</h1>
          <p>Track your previous and current maintenance requests.</p>
        </section>

        <section className="request-filters">
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All statuses</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="on_the_way">On the way</option>
            <option value="in_progress">In progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
            <option value="rejected">Rejected</option>
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

          <button
            className="clear-filter-btn"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setDateFilter("");
            }}
          >
            Clear Filters
          </button>
        </section>

        {error && <div className="auth-error">{error}</div>}

        {filteredRequests.length === 0 ? (
          <section className="card">
            <h3>No requests found</h3>
            <p>Your maintenance requests will appear here.</p>
          </section>
        ) : (
          <section className="request-list">
            {filteredRequests.map((request) => (
              <article className="history-card" key={request.id}>
                <div className="request-card-header">
                  <h3>{request.service}</h3>
                  <span className="status-badge">
                    {String(request.status || "-").replaceAll("_", " ")}
                  </span>
                </div>

                <div className="request-details-grid">
                  <p>
                    <strong>Description:</strong> {request.description || "-"}
                  </p>
                  <p>
                    <strong>Technician:</strong> {request.technician_name || "-"}
                  </p>
                  <p>
                    <strong>Date:</strong> {formatDateOnly(request.scheduled_date)}
                  </p>
                  <p>
                    <strong>Time:</strong> {formatTimeOnly(request.scheduled_time)}
                  </p>
                  <p>
                    <strong>City:</strong> {request.city || "-"}
                  </p>
                  <p>
                    <strong>Payment:</strong> {request.payment_method || "-"}
                  </p>
                  <p>
                    <strong>Amount:</strong>{" "}
                    {Number(request.total_price || request.amount || 0).toFixed(2)} JOD
                  </p>
                  <p>
                    <strong>Created:</strong>{" "}
                    {request.created_at
                      ? new Date(request.created_at).toLocaleString()
                      : "-"}
                  </p>
                </div>

                <div className="request-actions">
                  <button
                    className="primary"
                    onClick={() => navigate(`/review/${request.id}`)}
                  >
                    View Details
                  </button>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}

export default MaintenanceHistory;