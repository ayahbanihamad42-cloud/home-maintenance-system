import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../services/api";
import welcomeimage from "../../images/home.png";

function Login() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError("");

      const res = await API.post("/auth/login", form);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      const role = String(res.data.user?.role || "").toLowerCase();

      if (role === "admin") navigate("/admin");
      else if (role === "technician") navigate("/technician-dashboard");
      else navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || t("login.failed"));
    }
  };

  return (
    <div className="auth-shell">
      <div className="split-card">
        <section className="brand-panel">
          <h1 className="brand-logo-text">{t("brand")}</h1>

          <h2>{t("login.welcomeBack")}</h2>

          <p>
            {t("login.description")}
          </p>

          <img className="brand-icon" src={welcomeimage} alt="Khidma" />
        </section>

        <section className="form-panel">
          <h1>{t("login.title")}</h1>
          <p>{t("login.subtitle")}</p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>{t("login.email")}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t("login.emailPlaceholder")}
                required
              />
            </div>

            <div className="auth-field">
              <label>{t("login.password")}</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t("login.passwordPlaceholder")}
                required
              />
            </div>

            <button className="primary" type="submit">
              {t("login.submit")}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/register">{t("login.noAccount")} {t("login.registerLink")}</Link>
            <Link to="/forgot-password">{t("login.forgotPassword")}</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Login;