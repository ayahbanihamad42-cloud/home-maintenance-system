import React from "react";
import { useNavigate } from "react-router-dom";
import plumbingImg from "../../images/plumbing.png";
import electricalImg from "../../images/electrical.png";
import paintingImg from "../../images/Painting.png";
import decorationImg from "../../images/Decoration.png";
import Header from "../../components/common/Header.jsx";

function Home() {
  const navigate = useNavigate();

  const services = [
    { name: "Plumbing", img: plumbingImg },
    { name: "Electrical", img: electricalImg },
    { name: "Painting", img: paintingImg },
    { name: "Decoration", img: decorationImg }
  ];

  return (
    <>
      <Header /> {/* ← الهيدر يظهر فوق الصفحة */}

      <h2 className="home-title">Welcome to our services:</h2>

      <div className="services-container">
        {services.map((s, i) => (
          <div key={i} className="service-item">
            <div
              className="service-circle"
              onClick={() => navigate(`/services/${s.name}`)}
            >
              <img src={s.img} alt={s.name} width="24" height="24" />
            </div>
            <div className="service-name">{s.name}</div>
          </div>
        ))}
      </div>
    </>
  );
}

export default Home;
