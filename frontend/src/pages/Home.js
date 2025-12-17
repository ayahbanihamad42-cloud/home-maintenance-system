import React from "react";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();
  const services = ["Plumbing", "Electrical", "Cleaning", "Painting"];

  return (
    <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap" }}>
      {services.map((service, idx) => (
        <div key={idx} className="service-circle" onClick={() => navigate(`/technicians/${service}`)}>
          {service[0]}
          <p>{service}</p>
        </div>
      ))}
    </div>
  );
}

export default Home;
