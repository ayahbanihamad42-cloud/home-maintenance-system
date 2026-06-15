import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Header from "../../components/common/Header";
import API from "../../services/api.jsx";
import Footer from "../../components/common/Footer";

function getApiHost() {
  return String(API.defaults.baseURL || "http://localhost:5000/api").replace(
    /\/api\/?$/,
    ""
  );
}

function getBackendImageUrl(imageUrl, serviceName = "") {
  const apiHost = getApiHost();
  const value = String(imageUrl || "").trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/")
  ) {
    return value;
  }

  if (value.startsWith("/")) {
    return `${apiHost}${value}`;
  }

  if (value.startsWith("images/")) {
    return `${apiHost}/${value}`;
  }

  if (value) {
    return `${apiHost}/images/services/${value}`;
  }

  return `${apiHost}/images/services/${String(serviceName)
    .trim()
    .toLowerCase()}.png`;
}

function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadServices = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await API.get("/services");
      const data = Array.isArray(res.data) ? res.data : [];
      setServices(data);
    } catch (err) {
      console.error("load services error:", err);
      setServices([]);
      setError(t("home.failedToLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <>
      <Header />

      <main className="home-container">
        <section className="page-hero">
          <div>
            <h1>{t("home.heroTitle")}</h1>
            <p>{t("home.heroSubtitle")}</p>
          </div>
        </section>

        <section className="home-message card">
          <h2>{t("home.welcomeTitle")}</h2>
          <p>
            {t("home.description")}
          </p>

          <button className="primary" onClick={() => navigate("/history")}>
            {t("home.viewRequests")}
          </button>
        </section>

        <h2 className="section-title">{t("home.availableServices")}</h2>

        {loading ? (
          <section className="card">{t("home.loadingServices")}</section>
        ) : error ? (
          <section className="card">
            <p>{error}</p>
            <button className="primary" onClick={loadServices}>
              {t("home.tryAgain")}
            </button>
          </section>
        ) : services.length === 0 ? (
          <section className="card">{t("home.noServices")}</section>
        ) : (
          <section className="services-container">
            {services.map((service) => {
              const imageSrc = getBackendImageUrl(
                service.image_url,
                service.name
              );

              return (
                <article className="service-item" key={service.id || service.name}>
                  <button
                    className="service-circle"
                    onClick={() =>
                      navigate(`/technicians/${encodeURIComponent(service.name)}`)
                    }
                  >
                    {service.image_url ? (
                      <img
                        src={imageSrc}
                        alt={service.name}
                        onError={(e) => {
                          const fallback = `${getApiHost()}/images/services/${String(
                            service.name || ""
                          )
                            .trim()
                            .toLowerCase()}.png`;
                          if (e.currentTarget.src !== fallback) {
                            e.currentTarget.src = fallback;
                          }
                        }}
                      />
                    ) : (
                      <span style={{ fontSize: 42 }}>🛠️</span>
                    )}
                  </button>

                  <div className="service-name">{service.name}</div>
                </article>
              );
            })}
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

export default Home;