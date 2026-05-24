import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import API from "../../services/api.jsx";

function getBackendImageUrl(imageUrl) {
  if (!imageUrl) return "";

  const value = String(imageUrl).trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/")
  ) {
    return value;
  }

  if (value.startsWith("/images/")) {
    return `http://localhost:5000${value}`;
  }

  if (value.startsWith("images/")) {
    return `http://localhost:5000/${value}`;
  }

  return `http://localhost:5000/images/services/${value}`;
}

function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadServices = () => {
    setLoading(true);
    setError("");

    API.get("/services")
      .then((res) => {
        setServices(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("load services error:", err);
        setServices([]);
        setError("Failed to load services. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadServices();
  }, []);

  return (
    <>
      <Header />

      <div className="home-container">
        <h1 className="home-title">Welcome to our services:</h1>
        <p className="home-subtitle">Choose the service you need</p>

        {loading ? (
          <div className="home-message">Loading services...</div>
        ) : error ? (
          <div className="home-message error">
            <p>{error}</p>
            <button type="button" onClick={loadServices}>
              Try Again
            </button>
          </div>
        ) : services.length === 0 ? (
          <div className="home-message">No services available yet.</div>
        ) : (
          <div className="services-container">
            {services.map((service) => (
              <div className="service-item" key={service.id}>
                <button
                  type="button"
                  className="service-circle"
                  onClick={() =>
                    navigate(`/technicians/${encodeURIComponent(service.name)}`)
                  }
                >
                  {service.image_url ? (
                    <img
                      src={getBackendImageUrl(service.image_url)}
                      alt={service.name}
                    />
                  ) : (
                    <span className="service-fallback-icon">🛠️</span>
                  )}
                </button>

                <div className="service-name">{service.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;