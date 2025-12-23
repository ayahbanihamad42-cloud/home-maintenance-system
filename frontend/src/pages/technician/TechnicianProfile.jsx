import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTechnicianById } from "../../services/technicianService";

function TechnicianProfile() {
  const { id } = useParams();
  const [technician, setTechnician] = useState(null);

  useEffect(() => {
    getTechnicianById(id).then(setTechnician);
  }, [id]);

  if (!technician) return null;

  return (
    <div className="container">
      <h2>{technician.name}</h2>
      <p>{technician.service}</p>
      <p>{technician.phone}</p>
      <p>{technician.experience} years</p>
      <p>{technician.rating || 0} ⭐</p>
    </div>
  );
}

export default TechnicianProfile;
