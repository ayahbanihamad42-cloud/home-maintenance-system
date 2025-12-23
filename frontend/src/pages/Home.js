import React from "react";
import { useNavigate } from "react-router-dom";
import "../index.css";
import plumbingImg from "../images/plumbing.png";
import electricalImg from "../images/electrical.png";
import paintingImg from "../images/Painting.png";
import decorationImg from "../images/Decoration.png";

function Home() {
  const navigate = useNavigate();
  const services = [
    { name: "Plumbing", img: plumbingImg },
    { name: "Electrical", img: electricalImg },
    { name: "Painting", img: paintingImg },
    { name: "Decoration", img: decorationImg }
  ];

  return (
    <div className="home-container">
      <h2 className="home-title">Welcome to our services:</h2>
      <div className="services-container">
        {services.map((s, i) => (
          <div key={i} className="service-item">
            <div
              className="service-circle"
              onClick={() => navigate(`/technicians/${s.name}`)}
            >
              <img src={s.img} alt={s.name} />
            </div>
            <div className="service-name">{s.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
