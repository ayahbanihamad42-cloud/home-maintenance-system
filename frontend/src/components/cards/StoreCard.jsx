





  // React library
import React from "react";

 // Hook for page navigation
import { useNavigate } from "react-router-dom";

 // Card component to display store information
function StoreCard({ store }) {

    // Initialize navigation
  const navigate = useNavigate();

  return (
    <div className="card">
        {/* Store name */}
      <h3>{store.name}</h3>
        {/* Store service */}
      <p>{store.service}</p>
       {/* Store city */}
      <p>{store.city}</p>
       {/* Store address */}
      <p>{store.address}</p>

       {/* Navigate to booking request page */}
      <button
        className="primary"
        onClick={() => navigate(`/request/${store.storeId}`)}
      >
        Booking
      </button>

        {/* Navigate to store profile page */}
      <button
        className="secondary"
        onClick={() => navigate(`/store/${store.storeId}`)}
      >
        View Profile
      </button>
    </div>
  );
}
   // Export component
export default StoreCard;
