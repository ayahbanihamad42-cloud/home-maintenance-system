import React from "react";
import { useNavigate } from "react-router-dom";

function MaintenanceCard({ request }) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h3 style={{color: 'var(--text-blue)'}}>{request.service}</h3>
      <div style={{ margin: '15px 0', fontWeight: 'bold' }}>
         Status: <span style={{color: request.status === 'completed' ? 'green' : 'orange'}}>{request.status}</span>
      </div>
      <button className="primary" onClick={() => navigate(`/review/${request.id}`)}>
        View Details
      </button>
    </div>
  );
}
export default MaintenanceCard;