import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/common/Header";

import {
  getRequestById,
  cancelMaintenanceRequest,
} from "../../services/maintenanceService";

import {
  getRatingByRequest,
  submitRating,
} from "../../services/ratingService";

function Review() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [ratingData, setRatingData] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState(null);

  const loadRequest = async () => {
    try {
      const data = await getRequestById(requestId);
      setRequest(data);
    } catch (err) {
      console.error("load review request error:", err);
      setMessage({
        type: "error",
        title: "Error",
        body: "Failed to load request.",
      });
    }
  };

  useEffect(() => {
    loadRequest();

    getRatingByRequest(requestId)
      .then((data) => {
        if (data) {
          setRatingData(data);
          setRating(data.rating || 5);
          setComment(data.comment || "");
        }
      })
      .catch(() => setRatingData(null));
  }, [requestId]);

  const status = String(request?.status || "").toLowerCase();

  const canCancel = useMemo(() => {
    return status === "pending";
  }, [status]);

  const canReview = useMemo(() => {
    return status === "completed";
  }, [status]);

  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).split("T")[0];
  };

  const handleCancel = async () => {
    try {
      setMessage(null);

      if (!canCancel) {
        setMessage({
          type: "warning",
          title: "Request Not Available",
          body: "You can cancel only pending requests.",
        });
        return;
      }

      await cancelMaintenanceRequest(requestId);

      setMessage({
        type: "success",
        title: "Cancelled Successfully",
        body: "Your request has been cancelled.",
      });

      loadRequest();
    } catch (err) {
      console.error("cancel error:", err);
      setMessage({
        type: "error",
        title: "Error",
        body:
          err.response?.data?.message ||
          "Failed to cancel request.",
      });
    }
  };

  const handleSubmitReview = async () => {
    try {
      setMessage(null);

      await submitRating({
        technician_id: request.technician_id,
        request_id: request.id,
        rating,
        comment,
      });

      setRatingData({ rating, comment });

      setMessage({
        type: "success",
        title: "Review Submitted",
        body: "Thank you for your feedback.",
      });
    } catch (err) {
      console.error("rating error:", err);
      setMessage({
        type: "error",
        title: "Error",
        body: "Failed to submit review.",
      });
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

      <div className="container">
        <h2>Request Review</h2>

        {message && (
          <div className={`message-box-card ${message.type}`}>
            <div className="message-box-title">{message.title}</div>
            <div className="message-box-body">{message.body}</div>
          </div>
        )}

        <div className="history-card">
          <div className="history-card-header">
            <h3>{request.service || request.service_type || "Maintenance"}</h3>
            <span className="status-pill">{request.status}</span>
          </div>

          <p className="history-description">
            {request.description || "No description"}
          </p>

          <div className="history-info-grid">
            <p>
              <b>Date:</b> {formatDate(request.scheduled_date)}
            </p>

            <p>
              <b>Time:</b> {request.scheduled_time || "-"}
            </p>

            <p>
              <b>Created At:</b>{" "}
              {request.created_at
                ? new Date(request.created_at).toLocaleString()
                : "-"}
            </p>

            <p>
              <b>Technician:</b>{" "}
              {request.technician_name || request.technician_id || "-"}
            </p>

            <p>
              <b>Location:</b>{" "}
              {request.location_note || request.location || request.city || "-"}
            </p>

            <p>
              <b>Payment:</b> {request.payment_method || "-"}
            </p>

            <p>
              <b>Total:</b>{" "}
              {Number(request.total_price || request.total || 0).toFixed(2)} JOD
            </p>
          </div>

          {canCancel && (
            <button className="secondary" onClick={handleCancel}>
              Cancel Request
            </button>
          )}
        </div>

        {canReview ? (
          <div className="card">
            <h3>Rate Technician</h3>

            <div className="input-group">
              <label>Rating</label>
              <select
                value={rating}
                disabled={!!ratingData}
                onChange={(e) => setRating(Number(e.target.value))}
              >
                <option value={5}>5 Stars</option>
                <option value={4}>4 Stars</option>
                <option value={3}>3 Stars</option>
                <option value={2}>2 Stars</option>
                <option value={1}>1 Star</option>
              </select>
            </div>

            <div className="input-group">
              <label>Comment</label>
              <textarea
                value={comment}
                disabled={!!ratingData}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Write your review..."
              />
            </div>

            <button
              className="primary"
              disabled={!!ratingData}
              onClick={handleSubmitReview}
            >
              Submit Review
            </button>
          </div>
        ) : (
          <p>Review is available only after the request is completed.</p>
        )}

        <button className="secondary" onClick={() => navigate("/history")}>
          Back to History
        </button>
      </div>
    </>
  );
}

export default Review;