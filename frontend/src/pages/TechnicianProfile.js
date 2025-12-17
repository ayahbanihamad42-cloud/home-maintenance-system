import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTechnicianById } from "../services/technicianService";

function TechnicianProfile() {
  const { id } = useParams();
  const [technician, setTechnician] = useState(null);

  useEffect(() => {
    const fetchTechnician = async () => {
      try {
        const data = await getTechnicianById(id);
        setTechnician(data);
      } catch (error) {
        alert(error.message);
      }
    };
    fetchTechnician();
  }, [id]);

  if (!technician) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>{technician.name}</h2>
      <p>Service: {technician.service}</p>
      <p>Phone: {technician.phone}</p>
      <p>Experience: {technician.experience} years</p>
      <p>Rating: {technician.rating || 0} ⭐</p>
    </div>
  );
}

export default TechnicianProfile;
