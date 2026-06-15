import React from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import welcomeimage from "../../images/home.png";

function Welcome() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="welcome-shell">
      <div className="split-card">
        <section className="brand-panel">
          <h1 className="brand-logo-text">{t("brand")}</h1>

          <h2>{t("welcome.tagline")}</h2>

          <p>
            {t("welcome.description")}
          </p>

          <div className="welcome-actions">
            <button className="primary" onClick={() => navigate("/register")}>
              {t("welcome.register")}
            </button>

            <button className="outline-btn" onClick={() => navigate("/login")}>
              {t("welcome.login")}
            </button>
          </div>
        </section>

        <section className="form-panel welcome-right-panel">
          <img className="brand-icon" src={welcomeimage} alt="Khidma" />

          <h1>{t("welcome.subtitle")}</h1>

          <p>
            {t("welcome.longDescription")}
          </p>
        </section>
      </div>
    </div>
  );
}

export default Welcome;