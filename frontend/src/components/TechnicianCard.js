import React from "react";
import { useNavigate } from "react-router-dom";

function TechnicianCard({ technician }) {
  const navigate = useNavigate();
  return (
    <div className="card">
      <div style={{ display: "flex", alignItems: "center" }}>
        <div style={{
          width: "60px", height: "60px", borderRadius: "50%",
          backgroundImage: `url(${technician.image || 'https://via.placeholder.com/60'})`,
          backgroundSize: "cover", marginRight: "15px"
        }}></div>
        <div>
          <h3>{technician.name}</h3>
          <p>{technician.service}</p>
          <p>Experience: {technician.experience} years</p>
          <p>Rating: {technician.rating || 0} ⭐</p>
        </div>
      </div>
      <div style={{ marginTop: "10px" }}>
        <button className="primary" onClick={() => navigate(`/request/${technician.id}`)}>Booking</button>
        <button className="secondary" onClick={() => navigate(`/technician/${technician.id}`)}>View Profile</button>
      </div>
    </div>
  );
}

export default TechnicianCard;
