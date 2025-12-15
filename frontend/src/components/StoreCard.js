function StoreCard({ storeName, location }) {
  return (
    <div className="card">
      <h3>{storeName}</h3>
      <p>Location: {location}</p>
    </div>
  );
}

export default StoreCard;