import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import API from "../../services/api";
import welcomeimage from "../../images/home.png";

const jordanCities = [
  "Amman",
  "Irbid",
  "Zarqa",
  "Balqa",
  "Madaba",
  "Karak",
  "Tafilah",
  "Ma'an",
  "Aqaba",
  "Jerash",
  "Ajloun",
  "Mafraq",
];

function Register() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    city: "",
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

      await API.post("/auth/register", form);

      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || t("register.failed"));
    }
  };

  return (
    <div className="auth-shell">
      <div className="split-card">
        <section className="brand-panel">
          <h1 className="brand-logo-text">{t("brand")}</h1>

          <h2>{t("register.tagline")}</h2>

          <p>
            {t("register.description")}
          </p>

          <img className="brand-icon" src={welcomeimage} alt="Khidma" />
        </section>

        <section className="form-panel">
          <h1>{t("register.title")}</h1>
          <p>{t("register.subtitle")}</p>

          {error && <div className="auth-error">{error}</div>}

          <form className="auth-form two-columns" onSubmit={handleSubmit}>
            <div className="auth-field">
              <label>{t("register.name")}</label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={t("register.namePlaceholder")}
                required
              />
            </div>

            <div className="auth-field">
              <label>{t("register.email")}</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder={t("register.emailPlaceholder")}
                required
              />
            </div>

            <div className="auth-field">
              <label>{t("register.phone")}</label>
              <input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder={t("register.phonePlaceholder")}
                required
              />
            </div>

            <div className="auth-field">
              <label>{t("register.dob")}</label>
              <input
                type="date"
                name="dob"
                value={form.dob}
                onChange={handleChange}
                required
              />
            </div>

            <div className="auth-field">
              <label>{t("register.city")}</label>
              <select
                name="city"
                value={form.city}
                onChange={handleChange}
                required
              >
                <option value="">{t("register.cityPlaceholder")}</option>
                {jordanCities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="auth-field">
              <label>{t("register.password")}</label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder={t("register.passwordPlaceholder")}
                required
              />
            </div>

            <button className="primary full-width" type="submit">
              {t("register.submit")}
            </button>
          </form>

          <div className="auth-links">
            <Link to="/login">{t("register.hasAccount")} {t("register.loginLink")}</Link>
          </div>
        </section>
      </div>
    </div>
  );
}

export default Register;