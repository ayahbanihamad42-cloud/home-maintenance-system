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
    getTechnicianById(id).then(setTechnician);
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
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
    alert("Request submitted");
  };

  if (!technician) return null;

  return (
    <div className="container">
      <h2>Request Service</h2>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Description</label>
          <textarea value={description} onChange={e => setDescription(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Address</label>
          <input value={address} onChange={e => setAddress(e.target.value)} />
        </div>

        <div className="input-group">
          <label>City</label>
          <input value={city} onChange={e => setCity(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Time</label>
          <input type="time" value={time} onChange={e => setTime(e.target.value)} />
        </div>

        <button className="primary">Submit Request</button>
      </form>
    </div>
  );
}

export default MaintenanceRequest;
