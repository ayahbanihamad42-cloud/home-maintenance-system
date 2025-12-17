import React from "react";
import { useNavigate } from "react-router-dom";

function MaintenanceCard({ request }) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h3>{request.service}</h3>
      <p>Technician: {request.technician?.name || "Not assigned"}</p>
      <p>Date: {request.date} Time: {request.time}</p>
      <p>Address: {request.address}</p>
      <p>Status: {request.status}</p>
      <button className="primary" onClick={() => navigate(`/review/${request.id}`)}>Review / Track</button>
    </div>
  );
}

export default MaintenanceCard;
