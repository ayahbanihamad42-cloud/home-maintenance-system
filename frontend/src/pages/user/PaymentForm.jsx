import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../components/common/Header";
import { confirmOnlinePayment } from "../../services/paymentService";

function PaymentForm() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const requestId = location.state?.requestId || "";
  const amount = Number(location.state?.amount || location.state?.total_price || 0);

  const [form, setForm] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const totalAmount = useMemo(() => {
    return Number(amount || 0).toFixed(2);
  }, [amount]);

  const onlyNumbers = (value) => {
    return String(value || "").replace(/\D/g, "");
  };

  const onlyLettersSpaces = (value) => {
    return String(value || "").replace(/[^a-zA-Z\s]/g, "");
  };

  const formatCardNumber = (value) => {
    const digits = onlyNumbers(value).slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value) => {
    let cleaned = String(value || "").replace(/[^\d/]/g, "");

    if (cleaned.startsWith("/")) {
      cleaned = "";
    }

    const digits = cleaned.replace(/\D/g, "").slice(0, 4);

    if (cleaned.includes("/")) {
      const month = digits.slice(0, 2);
      const year = digits.slice(2, 4);

      if (digits.length <= 2) {
        return month ? `${month}/` : "";
      }

      return `${month}/${year}`;
    }

    if (digits.length <= 2) {
      return digits;
    }

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };

  const handleChange = (field, value) => {
    setError("");
    setSuccess("");

    if (field === "nameOnCard") {
      setForm((prev) => ({
        ...prev,
        nameOnCard: onlyLettersSpaces(value),
      }));
      return;
    }

    if (field === "cardNumber") {
      setForm((prev) => ({
        ...prev,
        cardNumber: formatCardNumber(value),
      }));
      return;
    }

    if (field === "expiry") {
      setForm((prev) => ({
        ...prev,
        expiry: formatExpiry(value),
      }));
      return;
    }

    if (field === "cvv") {
      setForm((prev) => ({
        ...prev,
        cvv: onlyNumbers(value).slice(0, 4),
      }));
    }
  };

  const validatePayment = () => {
    const name = form.nameOnCard.trim();
    const cardDigits = onlyNumbers(form.cardNumber);
    const expiry = form.expiry.trim();
    const cvv = form.cvv.trim();

    if (!requestId) {
      return t("payment.missingRequestId");
    }

    if (!amount || amount <= 0) {
      return t("payment.invalidAmount");
    }

    if (!name) {
      return t("payment.enterNameOnCard");
    }

    if (!/^[a-zA-Z\s]{3,}$/.test(name)) {
      return t("payment.nameLettersOnly");
    }

    if (cardDigits.length !== 16) {
      return t("payment.cardDigitsError");
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return t("payment.expiryFormatError");
    }

    const [monthText, yearText] = expiry.split("/");
    const month = Number(monthText);
    const year = Number(`20${yearText}`);

    if (month < 1 || month > 12) {
      return t("payment.expiryMonthError");
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return t("payment.expiryPastError");
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      return t("payment.cvvError");
    }

    return "";
  };

  const handlePay = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    const validationError = validatePayment();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);

      const res = await confirmOnlinePayment(requestId, {
        amount: Number(totalAmount),
        card_last_four: onlyNumbers(form.cardNumber).slice(-4),
      });

      const transactionId = res?.transactionId || `mock_txn_${Date.now()}`;

      setSuccess(t("payment.success"));

      setTimeout(() => {
        navigate(`/payment-success/${requestId}`, {
          state: {
            requestId,
            amount: Number(totalAmount),
            transactionId,
            message:
              "Payment completed successfully. The technician received a mock deposit notification.",
          },
        });
      }, 600);
    } catch (err) {
      console.error("payment error:", err);

      setError(
        err.response?.data?.message ||
          t("payment.failed")
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="payment-container">
        <section className="page-hero">
          <h1>{t("payment.title")}</h1>
          <p>{t("payment.subtitle")}</p>
        </section>

        <section className="form-card payment-card">
          {error && <div className="auth-error">{error}</div>}
          {success && <div className="auth-success">{success}</div>}

          <form className="form-container" onSubmit={handlePay}>
            <div className="request-details-grid">
              <p>
                <strong>{t("payment.requestId")}:</strong> {requestId || "-"}
              </p>

              <p>
                <strong>{t("payment.totalAmount")}:</strong> {totalAmount} JOD
              </p>
            </div>

            <label>{t("payment.nameOnCard")}</label>
            <input
              value={form.nameOnCard}
              onChange={(e) => handleChange("nameOnCard", e.target.value)}
              placeholder="Aya Bani Hamad"
              autoComplete="cc-name"
            />

            <label>{t("payment.cardNumber")}</label>
            <input
              value={form.cardNumber}
              onChange={(e) => handleChange("cardNumber", e.target.value)}
              placeholder="4242 4242 4242 4242"
              inputMode="numeric"
              autoComplete="cc-number"
              maxLength="19"
            />

            <div className="form-row">
              <div>
                <label>{t("payment.expiry")}</label>
                <input
                  value={form.expiry}
                  onChange={(e) => handleChange("expiry", e.target.value)}
                  placeholder="12/29"
                  inputMode="numeric"
                  autoComplete="cc-exp"
                  maxLength="5"
                />
              </div>

              <div>
                <label>{t("payment.cvv")}</label>
                <input
                  value={form.cvv}
                  onChange={(e) => handleChange("cvv", e.target.value)}
                  placeholder="123"
                  inputMode="numeric"
                  autoComplete="cc-csc"
                  maxLength="4"
                />
              </div>
            </div>

            <button className="primary" type="submit" disabled={loading}>
              {loading ? t("payment.processing") : t("payment.payNow")}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

export default PaymentForm;