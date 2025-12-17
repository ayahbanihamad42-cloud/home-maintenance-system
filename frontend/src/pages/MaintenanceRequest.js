import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getTechnicianById } from "../services/technicianService";
import { createMaintenanceRequest } from "../services/maintenanceService";

function MaintenanceRequest() {
  const { id } = useParams();
  const [technician, setTechnician] = useState(null);
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      await createMaintenanceRequest({
        user_id: user.id,
        technician_id: id,
        service: technician.service,
        description,
        address,
        city,
        date,
        time,
        status: "pending"
      });
      alert("Request submitted successfully");
    } catch (error) {
      alert(error.message);
    }
  };

  if (!technician) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>Request Service: {technician.name}</h2>
      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Description:</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Address:</label>
          <input value={address} onChange={e => setAddress(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>City:</label>
          <input value={city} onChange={e => setCity(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Date:</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
        <div className="input-group">
          <label>Time:</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} required />
        </div>
        <button className="primary" type="submit">Submit Request</button>
      </form>
    </div>
  );
}

export default MaintenanceRequest;
