import React from "react";
import { useNavigate } from "react-router-dom";

function TechnicianCard({ technician }) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h3>{technician.name}</h3>
      <p>{technician.service}</p>
      <p>{technician.experience} years</p>

      <button
        className="primary"
        onClick={() => navigate(`/request/${technician.technicianId}`)}
      >
        Booking
      </button>

      <button
        className="secondary"
        onClick={() => navigate(`/technician/${technician.technicianId}`)}
      >
        View Profile
      </button>
    </div>
  );
}

export default TechnicianCard;
