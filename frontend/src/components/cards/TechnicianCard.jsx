   // React library
import React from "react";

   // Hook for page navigation
import { useNavigate } from "react-router-dom";

   // Card component to display technician information
function TechnicianCard({ technician }) {
  const navigate = useNavigate();

  return (
    <div className="card">
        {/* Technician name */}
      <h3>{technician.name}</h3>
        {/* Technician service */}
      <p>{technician.service}</p>
       {/* Technician experience */}
      <p>{technician.experience} years</p>

      {/* Navigate to booking request page */}
      <button
        className="primary"
        onClick={() => navigate(`/request/${technician.technicianId}`)}
      >
        Booking
      </button>

      {/* Navigate to technician profile page */} 
      <button
        className="secondary"
        onClick={() => navigate(`/technician/${technician.technicianId}`)}
      >
        View Profile
      </button>
    </div>
  );
}
   // Export component
export default TechnicianCard;
