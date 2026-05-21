import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import API from "../../services/api.jsx";

function getBackendImageUrl(imageUrl) {
  if (!imageUrl) return "";

  if (
    String(imageUrl).startsWith("http://") ||
    String(imageUrl).startsWith("https://") ||
    String(imageUrl).startsWith("data:image/")
  ) {
    return imageUrl;
  }

  const cleanPath = String(imageUrl).startsWith("/")
    ? String(imageUrl)
    : `/${imageUrl}`;

  return `http://localhost:5000${cleanPath}`;
}

function Home() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  useEffect(() => {
    API.get("/admin/services")
      .then((res) => {
        setServices(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.error("load services error:", err);
        setServices([]);
      });
  }, []);

  return (
    <>
      <Header />

      <div className="home-container">
        <h1 className="home-title">Welcome to our services:</h1>

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
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                ) : (
                  <span className="service-fallback-icon">🛠️</span>
                )}
              </button>

              <div className="service-name">{service.name}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default Home;