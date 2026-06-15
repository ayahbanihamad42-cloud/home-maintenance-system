import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../services/api";
import welcomeimage from "../../images/home.png";

function ForgotPassword() {
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");
      setMessage("");

      const res = await API.post("/auth/forgotPassword", { email });

      setMessage(
        res.data?.message ||
          t("forgot.success")
      );
    } catch (err) {
      setError(err.response?.data?.message || t("forgot.failed"));
    }
  };

  return (
    <div className="auth-shell">
      <div className="split-card">
        <section className="brand-panel">
          <h1 className="brand-logo-text">{t("brand")}</h1>

          <h2>{t("forgot.tagline")}</h2>

          <p>
            {t("forgot.description")}
          </p>

          <img className="brand-icon" src={welcomeimage} alt="Khidma" />
        </section>

        <section className="form-panel">
          <h1>{t("forgot.title")}</h1>
          <p>{t("forgot.subtitle")}</p>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>{t("forgot.email")}</label>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t("forgot.emailPlaceholder")}
                required
              />
            </div>

            <button className="primary" type="submit">
              {t("forgot.submit")}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/login">{t("forgot.backToLogin")}</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ForgotPassword;