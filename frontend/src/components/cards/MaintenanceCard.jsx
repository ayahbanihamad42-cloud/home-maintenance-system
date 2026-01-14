   //React library
import React from "react"; 

// Hook for page navigation
import { useNavigate } from "react-router-dom";

// Card component to display maintenance request info
function MaintenanceCard({ request, rating }) {

   // Initialize navigation
  const navigate = useNavigate();

  return (
    <div className="card">
      {/* Service name */}
      <h3 style={{color: 'var(--text-blue)'}}>{request.service}</h3>

      {/* Request status */}
      <div style={{ margin: '15px 0', fontWeight: 'bold' }}>
         Status: <span style={{color: request.status === 'completed' ? 'green' : 'orange'}}>{request.status}</span>
      </div>

       {/* Rating display */}
      {rating ? (
        <p><b>Rating:</b> {rating.rating} ⭐</p>
      ) : (
        <p><b>Rating:</b> Not submitted</p>
      )}

        {/* Navigate to review details */}
      <button className="primary" onClick={() => navigate(`/review/${request.id}`)}>
        View Details
      </button>
    </div>
  );
}
   // Export component
export default MaintenanceCard;
