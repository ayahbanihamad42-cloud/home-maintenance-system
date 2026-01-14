
const StoreCard = ({ store }) => (
  <div className="card">
    <h3>{store.name}</h3>
    <p>{store.services}</p>
    <p>⭐ {store.rating}</p>
  </div>
);

export default StoreCard;

