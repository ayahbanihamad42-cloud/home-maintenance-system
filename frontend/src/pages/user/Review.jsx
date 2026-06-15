import React, { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../components/common/Header";
import API from "../../services/api.jsx";
import { useNavigate, useParams } from "react-router-dom";

function Review() {
  const { requestId } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();

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
        setError(err.response?.data?.message || t("review.loadFailed"));
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
      setMessage(t("review.reviewAfterCompletion"));
      return;
    }

    if (existingReview) {
      setMessage(t("review.alreadyReviewed"));
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
      setMessage(t("review.submitSuccess"));

      setTimeout(() => navigate("/history"), 900);
    } catch (err) {
      setError(err.response?.data?.message || t("review.submitFailed"));
    }
  };

  const cancelRequest = async () => {
    try {
      setCancelLoading(true);
      setError("");
      setMessage("");

      await API.delete(`/maintenance/${requestId}`);

      setMessage(t("review.cancelSuccess"));
      await loadRequest(true);

      setTimeout(() => navigate("/history"), 900);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          t("review.cancelFailed")
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
          <h1>{t("review.title")}</h1>
          <p>{t("review.subtitle")}</p>
        </section>

        {message && <div className="auth-success">{message}</div>}
        {error && <div className="auth-error">{error}</div>}

        {!request ? (
          <section className="card">
            <h3>{t("review.noRequestFound")}</h3>
          </section>
        ) : (
          <section className="review-card">
            <div className="request-card-header">
              <h2>{request.service || t("review.maintenanceRequest")}</h2>
              <span className="status-badge">
                {String(request.status || "-").replaceAll("_", " ")}
              </span>
            </div>

            <div className="request-details-grid">
              <p>
                <strong>{t("review.descriptionLabel")}:</strong> {request.description || "-"}
              </p>

              <p>
                <strong>{t("review.technicianLabel")}:</strong>{" "}
                {request.technician_name || technician?.name || "-"}
              </p>

              <p>
                <strong>{t("review.requestDateLabel")}:</strong>{" "}
                {formatDate(request.scheduled_date)}
              </p>

              <p>
                <strong>{t("review.requestTimeLabel")}:</strong>{" "}
                {formatTime(request.scheduled_time)}
              </p>

              <p>
                <strong>{t("review.createdAtLabel")}:</strong>{" "}
                {request.created_at
                  ? new Date(request.created_at).toLocaleString()
                  : "-"}
              </p>

              <p>
                <strong>{t("review.paymentMethodLabel")}:</strong> {request.payment_method || "-"}
              </p>

              <p>
                <strong>{t("review.amountLabel")}:</strong>{" "}
                {formatMoney(request.total_price || request.amount)}
              </p>

              <p>
                <strong>{t("review.cityLabel")}:</strong> {request.city || "-"}
              </p>

              <p>
                <strong>{t("review.locationNoteLabel")}:</strong> {request.location_note || "-"}
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
                  {cancelLoading ? t("review.cancelling") : t("review.cancelRequest")}
                </button>
              </div>
            )}

            {shouldShowLocationWaitingMessage && (
              <div className="auth-success">
                <strong>{t("review.locationNotLive")}</strong>
                <div>
                  {t("review.locationWillAppear")}
                </div>
              </div>
            )}

            {shouldShowTechnicianMap && techLat && techLng && (
              <div className="map-card">
                <h3>{t("review.technicianLiveLocation")}</h3>
                <iframe
                  title="technician-live-location"
                  src={getMapSrc(techLat, techLng)}
                  width="100%"
                  height="260"
                  style={{ border: 0 }}
                  loading="lazy"
                />
                <p>
                  {t("review.locationRefreshes")}
                </p>
              </div>
            )}

            {shouldShowTechnicianMap && (!techLat || !techLng) && (
              <div className="auth-error">
                {t("review.locationNotReceived")}
              </div>
            )}

            {!isCompleted && (
              <div className="auth-error">
                {t("review.ratingAfterCompletion")}
              </div>
            )}

            {existingReview && (
              <div className="auth-success">
                <strong>{t("review.alreadyReviewedLabel")}</strong>
                <div>{t("review.ratingLabel")}: {existingReview.rating}</div>
                <div>{t("review.commentLabel")}: {existingReview.comment || "-"}</div>
              </div>
            )}

            {canReview && (
              <form className="form-container" onSubmit={submitReview}>
                <label>{t("review.ratingLabel")}</label>

                <select
                  value={form.rating}
                  onChange={(e) =>
                    setForm({ ...form, rating: e.target.value })
                  }
                >
                  <option value="5">{t("review.excellent")}</option>
                  <option value="4">{t("review.veryGood")}</option>
                  <option value="3">{t("review.good")}</option>
                  <option value="2">{t("review.fair")}</option>
                  <option value="1">{t("review.poor")}</option>
                </select>

                <label>{t("review.commentLabel")}</label>

                <textarea
                  value={form.comment}
                  onChange={(e) =>
                    setForm({ ...form, comment: e.target.value })
                  }
                  rows="5"
                  required
                />

                <button className="primary" type="submit">
                  {t("review.submitReview")}
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