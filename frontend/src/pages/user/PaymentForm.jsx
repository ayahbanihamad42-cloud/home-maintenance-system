import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import {
  createPaymentIntent,
  confirmOnlinePayment,
} from "../../services/paymentService";

function PaymentForm() {
  const navigate = useNavigate();
  const location = useLocation();

  const paymentData = location.state || {};

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saving, setSaving] = useState(false);

  const requestId = paymentData.requestId;
  const amount = Number(paymentData.amount || paymentData.total_price || 0);

  const submitPayment = async (e) => {
    e.preventDefault();

    if (!cardName.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      alert("Please fill all payment fields.");
      return;
    }

    if (!requestId) {
      alert("Request id is missing.");
      return;
    }

    try {
      setSaving(true);

      await createPaymentIntent({
        amount,
        requestId,
        technicianId: paymentData.technicianId,
        estimated_hours: paymentData.estimated_hours,
      }).catch(() => null);

      const confirmed = await confirmOnlinePayment(requestId, {
        amount,
      });

      navigate(`/payment-success/${requestId}`, {
        state: {
          transactionId: confirmed.transactionId,
          amount: confirmed.amount || amount,
          message:
            "Payment completed. The technician received a mock deposit notification.",
        },
      });
    } catch (err) {
      alert(err?.response?.data?.message || "Payment failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />

      <div className="container">
        <div className="panel" style={{ maxWidth: 650, margin: "40px auto" }}>
          <h2>Payment Details</h2>

          <p style={{ color: "#3a3028" }}>
            This is a mock payment form for testing.
          </p>

          <div className="input-group">
            <label>Request ID</label>
            <input value={requestId || ""} readOnly />
          </div>

          <div className="input-group">
            <label>Total Amount</label>
            <input value={`${amount.toFixed(2)} JOD`} readOnly />
          </div>

          <form onSubmit={submitPayment}>
            <div className="input-group">
              <label>Name on Card</label>
              <input
                value={cardName}
                onChange={(e) => setCardName(e.target.value)}
                placeholder="Aya Bani Hamad"
              />
            </div>

            <div className="input-group">
              <label>Card Number</label>
              <input
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                placeholder="4242 4242 4242 4242"
                maxLength={19}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <div className="input-group">
                <label>Expiry</label>
                <input
                  value={expiry}
                  onChange={(e) => setExpiry(e.target.value)}
                  placeholder="12/29"
                  maxLength={5}
                />
              </div>

              <div className="input-group">
                <label>CVV</label>
                <input
                  value={cvv}
                  onChange={(e) => setCvv(e.target.value)}
                  placeholder="123"
                  maxLength={4}
                />
              </div>
            </div>

            <button className="primary" disabled={saving} type="submit">
              {saving ? "Processing..." : "Pay Now"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

export default PaymentForm;