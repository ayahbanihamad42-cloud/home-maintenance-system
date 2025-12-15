import React from "react";

function MaintenanceCard({ title, description }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      <p>{description}</p>
      <button>Request Service</button>
    </div>
  );
}

export default MaintenanceCard;