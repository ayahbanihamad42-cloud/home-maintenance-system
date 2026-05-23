import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import {
  getMyTechnicianRequests,
  updateTechnicianRequestStatus,
} from "../../services/technicianService";

function TechnicianRequests() {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState(null);

  const formatDateOnly = (value) => {
    if (!value) return "-";
    const raw = String(value);
    const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    return raw.slice(0, 10);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
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
            onClick={() => updateStatus(item.id, "accepted")}
          >
            Accept
          </button>

          <button
            className="secondary"
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
          onClick={() => updateStatus(item.id, "completed")}
        >
          Completed
        </button>
      );
    }

    return null;
  };

  return (
    <>
      <Header />

      <div className="container request-container">
        <h2>Technician Requests</h2>

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
        ) : (
          <div className="history-list">
            {requests.map((item) => (
              <div className="history-card" key={item.id}>
                <div className="history-card-header">
                  <h3>{item.service || "-"}</h3>
                  <span className="status-pill">{item.status || "-"}</span>
                </div>

                <div className="history-info-grid">
                  <p>
                    <b>User:</b> {item.user_name || item.customer_name || "-"}
                  </p>
                  <p>
                    <b>Phone:</b> {item.user_phone || "-"}
                  </p>
                  <p>
                    <b>Date:</b> {formatDateOnly(item.scheduled_date)}
                  </p>
                  <p>
                    <b>Time:</b> {item.scheduled_time || "-"}
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