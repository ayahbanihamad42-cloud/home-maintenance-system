import React from "react";
import { useNavigate } from "react-router-dom";

function MaintenanceCard({ request }) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h3>{request.service}</h3>
      <p>{request.status}</p>
      <button
        className="primary"
        onClick={() => navigate(`/review/${request.id}`)}
      >
        View
      </button>
    </div>
  );
}

export default MaintenanceCard;
