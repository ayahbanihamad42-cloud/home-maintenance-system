import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const services = ["Plumbing", "Electrical", "Cleaning", "Painting"];

  return (
    <div className="container">
      {services.map((s, i) => (
        <div
          key={i}
          className="service-circle"
          onClick={() => navigate(`/technicians/${s}`)}
        >
          {s}
        </div>
      ))}
    </div>
  );
}

export default Home;
