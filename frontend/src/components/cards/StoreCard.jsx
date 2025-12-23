import React from "react";

function StoreCard({ store }) {
  return (
    <div className="card">
      <h3>{store.name}</h3>
      <p>{store.service}</p>
      <p>{store.phone}</p>
      <p>{store.city}</p>
    </div>
  );
}

export default StoreCard;
