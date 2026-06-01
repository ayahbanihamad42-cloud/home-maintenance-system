import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/common/Header";

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId } = useParams();

  const amount = Number(location.state?.amount || 0);
  const transactionId = location.state?.transactionId || `mock_txn_${Date.now()}`;
  const message =
    location.state?.message ||
    "Payment completed successfully. The technician received a mock deposit notification.";

  return (
    <>
      <Header />

      <main className="payment-success-container">
        <section className="page-hero">
          <h1>Payment Successful</h1>
          <p>Your online payment has been completed successfully.</p>
        </section>

        <section className="form-card payment-success-card">
          <div className="success-icon">✓</div>

          <h2>Success</h2>
          <p>{message}</p>

          <div className="request-details-grid">
            <p>
              <strong>Request ID:</strong> {requestId || "-"}
            </p>

            <p>
              <strong>Transaction ID:</strong> {transactionId}
            </p>

            <p>
              <strong>Total Paid:</strong> {amount.toFixed(2)} JOD
            </p>
          </div>

          <div className="request-actions">
            <button
              className="primary"
              type="button"
              onClick={() => navigate(`/review/${requestId}`)}
            >
              Go to Review
            </button>

            <button
              className="secondary-btn"
              type="button"
              onClick={() => navigate("/history")}
            >
              Back to History
            </button>
          </div>
        </section>
      </main>
    </>
  );
}

export default PaymentSuccess;