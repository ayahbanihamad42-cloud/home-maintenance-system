import React, { useEffect, useMemo, useState } from "react";
import Header from "../../components/common/Header";
import API from "../../services/api.jsx";
import { useNavigate, useParams } from "react-router-dom";

function Review() {
  const { requestId } = useParams();
  const navigate = useNavigate();

  const [request, setRequest] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [technician, setTechnician] = useState(null);
  const [form, setForm] = useState({ rating: 5, comment: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);

  const formatDate = (value) => (value ? String(value).slice(0, 10) : "-");
  const formatTime = (value) => (value ? String(value).slice(0, 8) : "-");
  const formatMoney = (value) => `${Number(value || 0).toFixed(2)} JOD`;

  const currentStatus = useMemo(() => {
    return String(request?.status || "").toLowerCase();
  }, [request]);

  const isCompleted = currentStatus === "completed";
  const canReview = isCompleted && !existingReview;

  /*
    حسب الباك الحالي عندك:
    DELETE /maintenance/:id يسمح بالإلغاء فقط إذا status = pending.
    لو حطيناه على accepted/on_the_way رح يعطي error من الباك.
  */
  const canCancel = currentStatus === "pending";

  const shouldShowLocationWaitingMessage =
    currentStatus === "accepted" || currentStatus === "confirmed";

  const shouldShowTechnicianMap = currentStatus === "on_the_way";

  const getMapSrc = (lat, lng) =>
    `https://www.google.com/maps?q=${lat},${lng}&z=16&output=embed`;

  const loadRequest = async (silent = false) => {
    try {
      if (!silent) {
        setError("");
      }

      const res = await API.get(`/maintenance/${requestId}`);
      const data = res.data || null;

      setRequest(data);

      const techId = data?.technician_id || data?.technicianId;

      if (techId) {
        try {
          const techRes = await API.get(`/technicians/${techId}`);
          setTechnician(techRes.data || null);
        } catch {
          setTechnician(null);
        }
      }

      try {
        const reviewRes = await API.get(`/ratings/request/${requestId}`);
        setExistingReview(reviewRes.data || null);
      } catch {
        setExistingReview(null);
      }
    } catch (err) {
      if (!silent) {
        setError(err.response?.data?.message || "Failed to load request.");
      }
    }
  };

  useEffect(() => {
    if (requestId) {
      loadRequest(false);
    }
  }, [requestId]);

  useEffect(() => {
    if (!requestId) return;

    const timer = setInterval(() => {
      loadRequest(true);
    }, 8000);

    return () => clearInterval(timer);
  }, [requestId]);

  const submitReview = async (e) => {
    e.preventDefault();

    if (!isCompleted) {
      setMessage("Review is available only after the request is completed.");
      return;
    }

    if (existingReview) {
      setMessage("You already reviewed this request.");
      return;
    }

    try {
      setError("");

      await API.post("/ratings", {
        request_id: Number(requestId),
        technician_id: request?.technician_id,
        rating: Number(form.rating),
        comment: form.comment,
      });

      setExistingReview({ rating: form.rating, comment: form.comment });
      setMessage("Review submitted successfully.");

      setTimeout(() => navigate("/history"), 900);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit review.");
    }
  };

  const cancelRequest = async () => {
    try {
      setCancelLoading(true);
      setError("");
      setMessage("");

      await API.delete(`/maintenance/${requestId}`);

      setMessage("Request cancelled successfully.");
      await loadRequest(true);

      setTimeout(() => navigate("/history"), 900);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to cancel request. This request may no longer be cancellable."
      );
    } finally {
      setCancelLoading(false);
    }
  };

  const techLat =
    request?.technician_location_lat ||
    request?.technician_lat ||
    request?.current_lat ||
    technician?.technician_location_lat ||
    technician?.technician_lat ||
    technician?.current_lat ||
    technician?.latitude ||
    technician?.location_lat;

  const techLng =
    request?.technician_location_lng ||
    request?.technician_lng ||
    request?.current_lng ||
    technician?.technician_location_lng ||
    technician?.technician_lng ||
    technician?.current_lng ||
    technician?.longitude ||
    technician?.location_lng;

  return (
    <>
      <Header />

      <main className="review-container" style={{ paddingTop: "135px" }}>
        <section className="page-hero">
          <h1>Request Details</h1>
          <p>View request information and submit a review after completion.</p>
        </section>

        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        {!request ? (
          <section className="card">
            <h3>No request found</h3>
          </section>
        ) : (
          <section className="review-card">
            <div className="request-card-header">
              <h2>{request.service || "Maintenance Request"}</h2>
              <span className="status-badge">
                {String(request.status || "-").replaceAll("_", " ")}
              </span>
            </div>

            <div className="request-details-grid">
              <p>
                <strong>Description:</strong> {request.description || "-"}
              </p>

              <p>
                <strong>Technician:</strong>{" "}
                {request.technician_name || technician?.name || "-"}
              </p>

              <p>
                <strong>Request Date:</strong>{" "}
                {formatDate(request.scheduled_date)}
              </p>

              <p>
                <strong>Request Time:</strong>{" "}
                {formatTime(request.scheduled_time)}
              </p>

              <p>
                <strong>Created At:</strong>{" "}
                {request.created_at
                  ? new Date(request.created_at).toLocaleString()
                  : "-"}
              </p>

              <p>
                <strong>Payment Method:</strong> {request.payment_method || "-"}
              </p>

              <p>
                <strong>Amount:</strong>{" "}
                {formatMoney(request.total_price || request.amount)}
              </p>

              <p>
                <strong>City:</strong> {request.city || "-"}
              </p>

              <p>
                <strong>Location Note:</strong> {request.location_note || "-"}
              </p>
            </div>

            {canCancel && (
              <div className="request-actions">
                <button
                  className="danger-btn"
                  type="button"
                  disabled={cancelLoading}
                  onClick={cancelRequest}
                >
                  {cancelLoading ? "Cancelling..." : "Cancel Request"}
                </button>
              </div>
            )}

            {shouldShowLocationWaitingMessage && (
              <div className="auth-success">
                <strong>Technician location is not live yet.</strong>
                <div>
                  The technician location will appear here when the status
                  becomes On The Way.
                </div>
              </div>
            )}

            {shouldShowTechnicianMap && techLat && techLng && (
              <div className="map-card">
                <h3>Technician Live Location</h3>
                <iframe
                  title="technician-live-location"
                  src={getMapSrc(techLat, techLng)}
                  width="100%"
                  height="260"
                  style={{ border: 0 }}
                  loading="lazy"
                />
                <p>
                  This location refreshes automatically when the technician
                  updates their location.
                </p>
              </div>
            )}

            {shouldShowTechnicianMap && (!techLat || !techLng) && (
              <div className="auth-error">
                Technician status is On The Way, but the live location has not
                been received yet.
              </div>
            )}

            {!isCompleted && (
              <div className="auth-error">
                Rating appears only after the request status becomes completed.
              </div>
            )}

            {existingReview && (
              <div className="auth-success">
                <strong>Already reviewed.</strong>
                <div>Rating: {existingReview.rating}</div>
                <div>Comment: {existingReview.comment || "-"}</div>
              </div>
            )}

            {canReview && (
              <form className="form-container" onSubmit={submitReview}>
                <label>Rating</label>

                <select
                  value={form.rating}
                  onChange={(e) =>
                    setForm({ ...form, rating: e.target.value })
                  }
                >
                  <option value="5">5 - Excellent</option>
                  <option value="4">4 - Very Good</option>
                  <option value="3">3 - Good</option>
                  <option value="2">2 - Fair</option>
                  <option value="1">1 - Poor</option>
                </select>

                <label>Comment</label>

                <textarea
                  value={form.comment}
                  onChange={(e) =>
                    setForm({ ...form, comment: e.target.value })
                  }
                  rows="5"
                  required
                />

                <button className="primary" type="submit">
                  Submit Review
                </button>
              </form>
            )}
          </section>
        )}
      </main>
    </>
  );
}

export default Review;