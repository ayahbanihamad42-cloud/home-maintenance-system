import React from "react";
import { useNavigate } from "react-router-dom";

function TechnicianCard({ technician }) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <div className="tech-header">
        <div
          className="tech-avatar"
          style={{ backgroundImage: `url(${technician.image})` }}
        />
        <div>
          <h3>{technician.name}</h3>
          <p>{technician.service}</p>
          <p>{technician.experience} years</p>
        </div>
      </div>

      <div className="tech-actions">
        <button className="primary" onClick={() => navigate(`/request/${technician.id}`)}>
          Booking
        </button>
        <button className="secondary" onClick={() => navigate(`/technician/${technician.id}`)}>
          View Profile
        </button>
      </div>
    </div>
  );
}

export default TechnicianCard;
