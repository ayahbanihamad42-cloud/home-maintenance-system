import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import Header from "../../components/common/Header";

function PaymentSuccess() {
  const location = useLocation();
  const navigate = useNavigate();
  const { requestId } = useParams();

  const transactionId = location.state?.transactionId || "";
  const totalPrice = location.state?.totalPrice || 0;

  return (
    <>
      <Header />

      <div className="container request-container">
        <h2>Payment Successful</h2>

        <div className="request-grid">
          <div className="input-group full-width">
            <label>Request ID</label>
            <div className="readonly-field">{requestId}</div>
          </div>

          <div className="input-group full-width">
            <label>Transaction ID</label>
            <div className="readonly-field">{transactionId}</div>
          </div>

          <div className="input-group full-width">
            <label>Total Paid</label>
            <div className="readonly-field">
              {Number(totalPrice).toFixed(2)} JOD
            </div>
          </div>
        </div>

        <button className="primary" onClick={() => navigate(`/review/${requestId}`)}>
          Go to Review
        </button>
      </div>
    </>
  );
}

export default PaymentSuccess;