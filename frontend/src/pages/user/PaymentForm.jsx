import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";

function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const requestId = location.state?.requestId || "";
  const amount = Number(location.state?.amount || 0);

  const [form, setForm] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [error, setError] = useState("");

  const handlePay = (e) => {
    e.preventDefault();
    setError("");

    if (!form.nameOnCard || !form.cardNumber || !form.expiry || !form.cvv) {
      setError("Please fill all payment fields.");
      return;
    }

    navigate(`/payment-success/${requestId}`, {
      state: {
        requestId,
        amount,
        transactionId: `mock_txn_${Date.now()}`,
        message: "Payment completed successfully. The technician received a mock deposit notification.",
      },
    });
  };

  return (
    <>
      <Header />

      <main className="payment-container">
        <section className="page-hero">
          <h1>Payment Details</h1>
          <p>This is a mock online payment form for testing.</p>
        </section>

        <section className="form-card payment-card">
          {error && <div className="auth-error">{error}</div>}

          <form className="form-container" onSubmit={handlePay}>
            <div className="request-details-grid">
              <p><strong>Request ID:</strong> {requestId || "-"}</p>
              <p><strong>Total Amount:</strong> {amount.toFixed(2)} JOD</p>
            </div>

            <label>Name on Card</label>
            <input
              value={form.nameOnCard}
              onChange={(e) => setForm({ ...form, nameOnCard: e.target.value })}
              placeholder="Aya Bani Hamad"
            />

            <label>Card Number</label>
            <input
              value={form.cardNumber}
              onChange={(e) => setForm({ ...form, cardNumber: e.target.value })}
              placeholder="4242 4242 4242 4242"
              maxLength="19"
            />

            <div className="form-row">
              <div>
                <label>Expiry</label>
                <input
                  value={form.expiry}
                  onChange={(e) => setForm({ ...form, expiry: e.target.value })}
                  placeholder="12/29"
                />
              </div>

              <div>
                <label>CVV</label>
                <input
                  value={form.cvv}
                  onChange={(e) => setForm({ ...form, cvv: e.target.value })}
                  placeholder="123"
                  maxLength="4"
                />
              </div>
            </div>

            <button className="primary" type="submit">
              Pay Now
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

export default Payment;