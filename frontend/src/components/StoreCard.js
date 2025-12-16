<<<<<<< HEAD
function StoreCard({ storeName, location }) {
  return (
    <div className="card">
      <h3>{storeName}</h3>
      <p>Location: {location}</p>
    </div>
  );
}

export default StoreCard;
=======

const StoreCard = ({ store }) => (
  <div className="card">
    <h3>{store.name}</h3>
    <p>{store.services}</p>
    <p>⭐ {store.rating}</p>
  </div>
);

export default StoreCard;

>>>>>>> 0dd4b88 (ayah push frontend)
