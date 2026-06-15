import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../services/api";
import welcomeimage from "../../images/home.png";

function ResetPassword() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { token } = useParams();

  const [form, setForm] = useState({
    password: "",
    confirmPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (form.password !== form.confirmPassword) {
      setError(t("reset.mismatch"));
      return;
    }

    try {
      setError("");
      setMessage("");

      const res = await API.post(`/auth/reset-password/${token}`, {
        password: form.password,
      });

      setMessage(res.data?.message || t("reset.success"));

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || t("reset.failed"));
    }
  };

  return (
    <div className="auth-shell">
      <div className="split-card">
        <section className="brand-panel">
          <h1 className="brand-logo-text">{t("brand")}</h1>

          <h2>{t("reset.tagline")}</h2>

          <p>
            {t("reset.description")}
          </p>

          <img className="brand-icon" src={welcomeimage} alt="Khidma" />
        </section>

        <section className="form-panel">
          <h1>{t("reset.title")}</h1>
          <p>{t("reset.subtitle")}</p>

          {error && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>{t("reset.newPassword")}</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t("reset.newPasswordPlaceholder")}
                required
              />
            </div>

            <div className="auth-field">
              <label>{t("reset.confirmPassword")}</label>
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder={t("reset.confirmPasswordPlaceholder")}
                required
              />
            </div>

            <button className="primary" type="submit">
              {t("reset.submit")}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/login">{t("reset.backToLogin")}</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ResetPassword;