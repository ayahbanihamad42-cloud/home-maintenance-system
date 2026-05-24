import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/common/Header";
import {
  getMyTechnicianRequests,
  updateTechnicianRequestStatus,
} from "../../services/technicianService";

const requestStatuses = [
  "all",
  "pending",
  "accepted",
  "on_the_way",
  "in_progress",
  "completed",
  "rejected",
  "cancelled",
];

function TechnicianRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState(null);

  const [statusFilter, setStatusFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("newest");

  const normalizeText = (value) => {
    return String(value || "").trim().toLowerCase();
  };

  const formatDateOnly = (value) => {
    if (!value) return "-";

    const raw = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw;
    }

    if (raw.includes("T")) {
      const d = new Date(raw);

      if (!Number.isNaN(d.getTime())) {
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return `${yyyy}-${mm}-${dd}`;
      }
    }

    const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];

    return raw.slice(0, 10);
  };

  const formatTimeOnly = (value) => {
    if (!value) return "-";

    const raw = String(value).trim();
    const match = raw.match(/^(\d{2}:\d{2})(:\d{2})?/);

    if (match) return match[0];

    return raw.slice(0, 8);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";

    const d = new Date(value);

    if (Number.isNaN(d.getTime())) {
      return String(value);
    }

    return d.toLocaleString();
  };

  const loadRequests = async () => {
    try {
      setMessage(null);

      const data = await getMyTechnicianRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setRequests([]);

      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to load requests.",
      });
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (statusFilter !== "all") {
      result = result.filter(
        (item) => normalizeText(item.status) === normalizeText(statusFilter)
      );
    }

    if (dateFilter) {
      result = result.filter(
        (item) => formatDateOnly(item.scheduled_date) === dateFilter
      );
    }

    if (search.trim()) {
      const q = normalizeText(search);

      result = result.filter((item) => {
        const target = [
          item.service,
          item.status,
          item.user_name,
          item.customer_name,
          item.user_phone,
          item.city,
          item.location_note,
          item.description,
          item.payment_method,
          item.scheduled_date,
          item.scheduled_time,
        ]
          .map((x) => normalizeText(x))
          .join(" ");

        return target.includes(q);
      });
    }

    if (sortFilter === "newest") {
      result.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
    }

    if (sortFilter === "oldest") {
      result.sort((a, b) => Number(a.id || 0) - Number(b.id || 0));
    }

    if (sortFilter === "date_asc") {
      result.sort((a, b) => {
        const aValue = `${formatDateOnly(a.scheduled_date)} ${formatTimeOnly(
          a.scheduled_time
        )}`;
        const bValue = `${formatDateOnly(b.scheduled_date)} ${formatTimeOnly(
          b.scheduled_time
        )}`;

        return aValue.localeCompare(bValue);
      });
    }

    if (sortFilter === "date_desc") {
      result.sort((a, b) => {
        const aValue = `${formatDateOnly(a.scheduled_date)} ${formatTimeOnly(
          a.scheduled_time
        )}`;
        const bValue = `${formatDateOnly(b.scheduled_date)} ${formatTimeOnly(
          b.scheduled_time
        )}`;

        return bValue.localeCompare(aValue);
      });
    }

    return result;
  }, [requests, statusFilter, dateFilter, search, sortFilter]);

  const updateStatus = async (requestId, status) => {
    try {
      await updateTechnicianRequestStatus(requestId, status);

      setMessage({
        type: "success",
        title: "Updated",
        body: "Request status updated successfully.",
      });

      await loadRequests();
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to update status.",
      });
    }
  };

  const nextButton = (item) => {
    const status = String(item.status || "").toLowerCase();

    if (status === "pending") {
      return (
        <>
          <button
            className="primary"
            type="button"
            onClick={() => updateStatus(item.id, "accepted")}
          >
            Accept
          </button>

          <button
            className="secondary"
            type="button"
            onClick={() => updateStatus(item.id, "rejected")}
          >
            Reject
          </button>
        </>
      );
    }

    if (status === "accepted") {
      return (
        <button
          className="primary"
          type="button"
          onClick={() => updateStatus(item.id, "on_the_way")}
        >
          On The Way
        </button>
      );
    }

    if (status === "on_the_way") {
      return (
        <button
          className="primary"
          type="button"
          onClick={() => updateStatus(item.id, "in_progress")}
        >
          In Progress
        </button>
      );
    }

    if (status === "in_progress") {
      return (
        <button
          className="primary"
          type="button"
          onClick={() => updateStatus(item.id, "completed")}
        >
          Completed
        </button>
      );
    }

    return null;
  };

  const clearFilters = () => {
    setStatusFilter("all");
    setSearch("");
    setDateFilter("");
    setSortFilter("newest");
  };

  return (
    <>
      <Header />

      <div className="container request-container">
        <div className="technician-requests-header">
          <div>
            <h2>Technician Requests</h2>
            <p className="page-subtitle">
              Manage assigned maintenance requests and update their status.
            </p>
          </div>

          <button className="secondary" type="button" onClick={clearFilters}>
            Clear Filters
          </button>
        </div>

        <div className="technician-filters-grid">
          <input
            className="technician-search-input"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by user, phone, city, service, status..."
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {requestStatuses.map((status) => (
              <option key={status} value={status}>
                {status === "all"
                  ? "All statuses"
                  : status.replaceAll("_", " ").toUpperCase()}
              </option>
            ))}
          </select>

          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />

          <select
            value={sortFilter}
            onChange={(e) => setSortFilter(e.target.value)}
          >
            <option value="newest">Newest request</option>
            <option value="oldest">Oldest request</option>
            <option value="date_asc">Schedule: earliest first</option>
            <option value="date_desc">Schedule: latest first</option>
          </select>
        </div>

        {message && (
          <div className={`message-box-card ${message.type}`}>
            <div className="message-box-title">{message.title}</div>
            <div className="message-box-body">{message.body}</div>
          </div>
        )}

        {requests.length === 0 ? (
          <div className="message-box-card">
            <div className="message-box-title">No requests</div>
            <div className="message-box-body">
              Your assigned maintenance requests will appear here.
            </div>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="message-box-card">
            <div className="message-box-title">No filtered results</div>
            <div className="message-box-body">
              No requests match the selected filters.
            </div>
          </div>
        ) : (
          <div className="history-list">
            {filteredRequests.map((item) => (
              <div className="history-card" key={item.id}>
                <div className="history-card-header">
                  <h3>{item.service || "-"}</h3>
                  <span className="status-pill">
                    {String(item.status || "-").replaceAll("_", " ")}
                  </span>
                </div>

                <div className="history-info-grid">
                  <p>
                    <b>User:</b> {item.user_name || item.customer_name || "-"}
                  </p>

                  <p>
                    <b>Phone:</b> {item.user_phone || "-"}
                  </p>

                  <p>
                    <b>Request Date:</b> {formatDateOnly(item.scheduled_date)}
                  </p>

                  <p>
                    <b>Request Time:</b> {formatTimeOnly(item.scheduled_time)}
                  </p>

                  <p>
                    <b>Created At:</b> {formatDateTime(item.created_at)}
                  </p>

                  <p>
                    <b>Location:</b> {item.location_note || item.city || "-"}
                  </p>

                  <p>
                    <b>Payment:</b> {item.payment_method || "-"}
                  </p>

                  <p>
                    <b>Total:</b> {Number(item.total_price || 0).toFixed(2)} JOD
                  </p>
                </div>

                <p className="history-description">
                  {item.description || "-"}
                </p>

                <div className="request-actions">{nextButton(item)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default TechnicianRequests;