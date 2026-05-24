import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/common/Header";
import {
  getRequestById,
  cancelMaintenanceRequest,
} from "../../services/maintenanceService";
import { addRating, getRatingByRequest } from "../../services/ratingService";

function Review() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [oldRating, setOldRating] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState(null);

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

    if (Number.isNaN(d.getTime())) return String(value);

    return d.toLocaleString();
  };

  const loadRequest = async () => {
    try {
      setMessage(null);

      const data = await getRequestById(requestId);
      setRequest(data);

      const ratingData = await getRatingByRequest(requestId).catch(() => null);
      setOldRating(ratingData || null);

      if (ratingData) {
        setRating(ratingData.rating || 5);
        setComment(ratingData.comment || "");
      }
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to load request.",
      });
    }
  };

  useEffect(() => {
    if (requestId) loadRequest();
  }, [requestId]);

  const handleCancel = async () => {
    try {
      await cancelMaintenanceRequest(requestId);

      setMessage({
        type: "success",
        title: "Cancelled",
        body: "Request cancelled successfully.",
      });

      await loadRequest();
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body:
          err?.response?.data?.message ||
          "This request cannot be cancelled now.",
      });
    }
  };

  const submitRating = async () => {
    try {
      if (!request?.technician_id) {
        setMessage({
          type: "error",
          title: "Error",
          body: "Technician id is missing.",
        });
        return;
      }

      await addRating({
        technician_id: request.technician_id,
        request_id: request.id,
        rating,
        comment,
      });

      setMessage({
        type: "success",
        title: "Saved",
        body: "Review submitted successfully.",
      });

      await loadRequest();
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to submit review.",
      });
    }
  };

  if (!request) {
    return (
      <>
        <Header />
        <div className="container">
          {message ? (
            <div className={`message-box-card ${message.type}`}>
              <div className="message-box-title">{message.title}</div>
              <div className="message-box-body">{message.body}</div>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </>
    );
  }

  const status = String(request.status || "").toLowerCase();
  const canCancel = status === "pending";
  const canReview = status === "completed";

  return (
    <>
      <Header />

      <div className="container request-container">
        <h2>Request Review</h2>

        {message && (
          <div className={`message-box-card ${message.type}`}>
            <div className="message-box-title">{message.title}</div>
            <div className="message-box-body">{message.body}</div>
          </div>
        )}

        <div className="history-card">
          <div className="history-card-header">
            <h3>{request.service || "-"}</h3>
            <span className="status-pill">
              {String(request.status || "-").replaceAll("_", " ")}
            </span>
          </div>

          <p className="history-description">{request.description || "-"}</p>

          <div className="history-info-grid">
            <p>
              <b>Request Date:</b> {formatDateOnly(request.scheduled_date)}
            </p>

            <p>
              <b>Request Time:</b> {formatTimeOnly(request.scheduled_time)}
            </p>

            <p>
              <b>Created At:</b> {formatDateTime(request.created_at)}
            </p>

            <p>
              <b>Technician:</b> {request.technician_name || "-"}
            </p>

            <p>
              <b>Location:</b> {request.location_note || request.city || "-"}
            </p>

            <p>
              <b>Payment:</b> {request.payment_method || "-"}
            </p>

            <p>
              <b>Total:</b> {Number(request.total_price || 0).toFixed(2)} JOD
            </p>
          </div>

          {canCancel && (
            <button className="secondary" type="button" onClick={handleCancel}>
              Cancel Request
            </button>
          )}
        </div>

        {!canReview ? (
          <>
            <p style={{ marginTop: 20 }}>
              Review is available only after the request is completed.
            </p>

            <button className="secondary" onClick={() => navigate("/history")}>
              Back to History
            </button>
          </>
        ) : oldRating ? (
          <div className="message-box-card success">
            <div className="message-box-title">Already Reviewed</div>
            <div className="message-box-body">
              Your rating: {oldRating.rating} ⭐
              <br />
              {oldRating.comment || "No comment."}
            </div>
          </div>
        ) : (
          <div className="card">
            <h3>Rate Technician</h3>

            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= rating ? "star active" : "star"}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <div className="input-group">
              <label>Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review..."
              />
            </div>

            <button className="primary" type="button" onClick={submitRating}>
              Submit Review
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default Review;