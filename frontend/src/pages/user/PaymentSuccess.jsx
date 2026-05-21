import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/common/Header";

function PaymentSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const { requestId } = useParams();

  const amount = Number(location.state?.amount || 0);
  const transactionId =
    location.state?.transactionId || `mock_txn_${Date.now()}`;

  return (
    <>
      <Header />

      <div className="container">
        <div className="panel" style={{ maxWidth: 900, margin: "40px auto" }}>
          <h2>Payment Successful</h2>

          <div className="input-group">
            <label>Request ID</label>
            <input value={requestId || ""} readOnly />
          </div>

          <div className="input-group">
            <label>Transaction ID</label>
            <input value={transactionId} readOnly />
          </div>

          <div className="input-group">
            <label>Total Paid</label>
            <input value={`${amount.toFixed(2)} JOD`} readOnly />
          </div>

          <button
            className="primary"
            onClick={() => navigate(`/review/${requestId}`)}
          >
            Go to Review
          </button>
        </div>
      </div>
    </>
  );
}

export default PaymentSuccess;