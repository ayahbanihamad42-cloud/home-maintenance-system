import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
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
      setError("Failed to load services. Please try again.");
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
            <h1>Book trusted home services</h1>
            <p>خدمة بيتك بسهولة وموثوقية</p>
          </div>
        </section>

        <section className="home-message card">
          <h2>Welcome to خدمة</h2>
          <p>
            Find skilled technicians, book maintenance requests, chat instantly,
            use AI assistance, and track your service from one modern platform.
          </p>

          <button className="primary" onClick={() => navigate("/history")}>
            View My Requests
          </button>
        </section>

        <h2 className="section-title">Available Services</h2>

        {loading ? (
          <section className="card">Loading services...</section>
        ) : error ? (
          <section className="card">
            <p>{error}</p>
            <button className="primary" onClick={loadServices}>
              Try Again
            </button>
          </section>
        ) : services.length === 0 ? (
          <section className="card">No services available yet.</section>
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