import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../components/common/Header";

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId } = useParams();
  const { t } = useTranslation();

  const amount = Number(location.state?.amount || 0);
  const transactionId = location.state?.transactionId || `mock_txn_${Date.now()}`;
  const message =
    location.state?.message ||
    "Payment completed successfully. The technician received a mock deposit notification.";

  return (
    <>
      <Header />

      <main className="payment-container">
        <section className="page-hero">
          <h1>{t("paymentSuccess.title")}</h1>
          <p>{t("paymentSuccess.subtitle")}</p>
        </section>

        <section className="form-card payment-success-card">
          <div className="success-icon">✓</div>

          <h2>{t("paymentSuccess.success")}</h2>
          <p>{message}</p>

          <div className="request-details-grid">
            <p>
              <strong>{t("paymentSuccess.requestId")}:</strong> {requestId || "-"}
            </p>

            <p>
              <strong>{t("paymentSuccess.transactionId")}:</strong> {transactionId}
            </p>

            <p>
              <strong>{t("paymentSuccess.totalPaid")}:</strong> {amount.toFixed(2)} JOD
            </p>
          </div>

          <div className="request-actions">
            <button
              className="primary"
              type="button"
              onClick={() => navigate(`/review/${requestId}`)}
            >
              {t("paymentSuccess.goToReview")}
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={() => navigate("/history")}
            >
              {t("paymentSuccess.backToHistory")}
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

export default PaymentSuccess;