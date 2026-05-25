import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import API from "../../services/api.jsx";

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

      console.log("SERVICES FROM API:", data);

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

      <div className="home-container">
        <h1 className="home-title">Welcome to our services:</h1>

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
            {services.map((service) => {
              const imageSrc = getBackendImageUrl(
                service.image_url,
                service.name
              );

              return (
                <div className="service-item" key={service.id}>
                  <button
                    type="button"
                    className="service-circle"
                    onClick={() =>
                      navigate(
                        `/technicians/${encodeURIComponent(service.name)}`
                      )
                    }
                  >
                    {service.image_url ? (
                      <img
                        src={imageSrc}
                        alt={service.name}
                        onError={(e) => {
                          console.log("Image failed:", e.currentTarget.src);

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
                      <span className="service-fallback-icon">🛠️</span>
                    )}
                  </button>

                  <div className="service-name">{service.name}</div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}

export default Home;