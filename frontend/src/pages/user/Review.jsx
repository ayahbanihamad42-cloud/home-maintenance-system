import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/common/Header";
import API from "../../services/api";

function Review() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const [request, setRequest] = useState(location.state?.createdRequest || null);
  const [message, setMessage] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).split("T")[0];
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleString();
  };

  const normalizedStatus = String(request?.status || "pending").toLowerCase();

  const canCancel = normalizedStatus === "pending";
  const canReview = normalizedStatus === "completed";

  const loadRequest = async () => {
    try {
      const res = await API.get(`/maintenance/${id}`);
      setRequest(res.data);
    } catch (err) {
      console.error("review load error:", err);
      setMessage({
        type: "error",
        title: "Error",
        body: "Failed to load request details.",
      });
    }
  };

  useEffect(() => {
    if (id) loadRequest();
  }, [id]);

  const cancelRequest = async () => {
    if (!canCancel) {
      setMessage({
        type: "warning",
        title: "Cannot Cancel",
        body: "This request is already accepted or started, so it cannot be cancelled.",
      });
      return;
    }

    try {
      setCancelling(true);

      await API.put(`/maintenance/${id}/status`, {
        status: "cancelled",
      });

      setRequest((prev) => ({
        ...prev,
        status: "cancelled",
      }));

      setMessage({
        type: "success",
        title: "Request Cancelled",
        body:
          String(request?.payment_method).toLowerCase() === "online"
            ? "Request cancelled. The refund notification was sent."
            : "Request cancelled successfully.",
      });
    } catch (err) {
      console.error("cancel request error:", err);

      setMessage({
        type: "error",
        title: "Error",
        body: err.response?.data?.message || "Failed to cancel request.",
      });
    } finally {
      setCancelling(false);
    }
  };

  const submitReview = async () => {
    if (!canReview) {
      setMessage({
        type: "warning",
        title: "Review Not Available",
        body: "Review is available only after the request is completed.",
      });
      return;
    }

    try {
      setSubmittingReview(true);

      await API.post("/ratings", {
        request_id: Number(id),
        technician_id: request.technician_id,
        rating,
        comment,
      });

      setMessage({
        type: "success",
        title: "Review Sent",
        body: "Thank you for your review.",
      });
    } catch (err) {
      console.error("submit review error:", err);

      setMessage({
        type: "error",
        title: "Error",
        body: err.response?.data?.message || "Failed to submit review.",
      });
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!request) {
    return (
      <>
        <Header />
        <div className="container">
          <h2>Request Review</h2>
          <p>Loading...</p>
        </div>
      </>
    );
  }

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
            <h3>{request.service || "Maintenance"}</h3>
            <span className="status-pill">{request.status || "pending"}</span>
          </div>

          <p className="history-description">
            {request.description || "No description"}
          </p>

          <div className="history-info-grid">
            <span>
              <b>Request Created:</b>{" "}
              {formatDateTime(request.created_at || request.createdAt)}
            </span>

            <span>
              <b>Scheduled Date:</b> {formatDate(request.scheduled_date)}
            </span>

            <span>
              <b>Scheduled Time:</b> {request.scheduled_time || "-"}
            </span>

            <span>
              <b>Technician:</b>{" "}
              {request.technician_name || request.technician_id || "-"}
            </span>

            <span>
              <b>Location:</b>{" "}
              {request.location_note || request.location || request.city || "-"}
            </span>

            <span>
              <b>Payment:</b> {request.payment_method || "-"}
            </span>

            <span>
              <b>Total:</b>{" "}
              {request.total_price
                ? `${Number(request.total_price).toFixed(2)} JOD`
                : "-"}
            </span>
          </div>

          {canCancel && (
            <button className="secondary" type="button" onClick={cancelRequest}>
              {cancelling ? "Cancelling..." : "Cancel Request"}
            </button>
          )}
        </div>

        {canReview ? (
          <div className="card">
            <h3>Write Review</h3>

            <div className="input-group">
              <label>Rating</label>
              <select value={rating} onChange={(e) => setRating(e.target.value)}>
                <option value="5">5 Stars</option>
                <option value="4">4 Stars</option>
                <option value="3">3 Stars</option>
                <option value="2">2 Stars</option>
                <option value="1">1 Star</option>
              </select>
            </div>

            <div className="input-group">
              <label>Comment</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your feedback..."
              />
            </div>

            <button className="primary" type="button" onClick={submitReview}>
              {submittingReview ? "Sending..." : "Submit Review"}
            </button>
          </div>
        ) : (
          <p>Review is available only after the request is completed.</p>
        )}

        <button className="secondary" type="button" onClick={() => navigate("/history")}>
          Back To History
        </button>
      </div>
    </>
  );
}

export default Review;