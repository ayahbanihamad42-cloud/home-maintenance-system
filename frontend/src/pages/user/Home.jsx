// Import React
import React from "react";

// Import navigation hook from react-router
import { useNavigate } from "react-router-dom";

// Import service images
import plumbingImg from "../../images/plumbing.png";
import electricalImg from "../../images/electrical.png";
import paintingImg from "../../images/Painting.png";
import decorationImg from "../../images/Decoration.png";

// Import Header component
import Header from "../../components/common/Header.jsx";

// Import global styles
import "../../index.css";

// Home page component
function Home() {

  // Hook for programmatic navigation
  const navigate = useNavigate();

  // List of available services with their images
  const services = [
    { name: "Plumbing", img: plumbingImg },
    { name: "Electrical", img: electricalImg },
    { name: "Painting", img: paintingImg },
    { name: "Decoration", img: decorationImg }
  ];

  return (
    <>
      {/* Page header */}
      <Header /> 

      {/* Page title */}
      <h2 className="home-title">Welcome to our services:</h2>

      {/* Services grid */}
      <div className="services-container">
        {services.map((s, i) => (
          <div key={i} className="service-item">

            {/* Clickable service icon */}
            <div
              className="service-circle"
              onClick={() => navigate(`/services/${s.name}`)}
            >
              <img
                src={s.img}
                alt={s.name}
                width="24"
                height="24"
              />
            </div>

            {/* Service name */}
            <div className="service-name">{s.name}</div>
          </div>
        ))}
      </div>
    </>
  );
}

// Export Home component
export default Home;
