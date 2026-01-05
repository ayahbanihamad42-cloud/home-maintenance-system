import React from "react";
import { useNavigate } from "react-router-dom";

function StoreCard({ store }) {
  const navigate = useNavigate();

  return (
    <div className="card">
      <h3>{store.name}</h3>
      <p>{store.service}</p>
      <p>{store.city}</p>
      <p>{store.address}</p>

      <button
        className="primary"
        onClick={() => navigate(`/request/${store.storeId}`)}
      >
        Booking
      </button>

      <button
        className="secondary"
        onClick={() => navigate(`/store/${store.storeId}`)}
      >
        View Profile
      </button>
    </div>
  );
}

export default StoreCard;
