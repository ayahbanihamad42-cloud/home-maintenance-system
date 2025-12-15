
function TechnicianCard({ name, specialty }) {
  return (
    <div className="card">
      <h3>{name}</h3>
      <p>Specialty: {specialty}</p>
      <button>View Profile</button>
    </div>
  );
}

export default TechnicianCard;
 StoreCard.js