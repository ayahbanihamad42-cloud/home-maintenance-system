import React from "react";

function StoreCard({ store }) {
  return (
    <div className="card">
      <h3>{store.name}</h3>
      <p>Service: {store.service}</p>
      <p>City: {store.city}</p>
    </div>
  );
}

export default StoreCard;
