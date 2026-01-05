/**
 * MaintenanceRequest Page (Improved)
 * --------------------------------
 * Fetches available time slots dynamically
 */
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import Header from "../../components/common/Header";
import { getTechnicians, getAvailability } from "../../services/technicianService";
import { createMaintenanceRequest } from "../../services/maintenanceService";

function MaintenanceRequest() {
  const { technicianId: initialTechnicianId } = useParams();
  const [service, setService] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState(initialTechnicianId || "");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");

  useEffect(() => {
    if (!service) return;
    getTechnicians(service).then((data) => setTechnicians(data));
  }, [service]);
  useEffect(() => {
    if (date && technicianId) {
      getAvailability(technicianId, date)
        .then((data) => setSlots(data));
    }
      }, [date, technicianId]);
  const submit = async () => {
    if (!service || !technicianId || !date || !time) return;
    await createMaintenanceRequest({
      technician_id: technicianId,
      description,
      scheduled_date: date,
      scheduled_time: time,
      city,
      service
    });
    alert("Request submitted");
  };

  return (
    <>
      <Header />
      <div className="container">
        <h2>Maintenance Request</h2>

        <div className="input-group">
          <label>Service Type</label>
          <select value={service} onChange={(e) => setService(e.target.value)}>
            <option value="">Select service</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Painting">Painting</option>
            <option value="Decoration">Decoration</option>
          </select>
        </div>

        <div className="input-group">
          <label>Technician</label>
          <select value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}>
            <option value="">Select technician</option>
            {technicians.map((tech) => (
              <option key={tech.technicianId} value={tech.technicianId}>
                {tech.name} - {tech.experience} yrs
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Date</label>
          <input type="date" onChange={e=>setDate(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Time Slot</label>
          <select value={time} onChange={e=>setTime(e.target.value)}>
            <option value="">Select time</option>
            {slots.map(slot => (
              <option key={slot.id} value={slot.start_time}>
                {slot.start_time}
              </option>
            ))}
          </select>
        </div>
         <div className="input-group">
          <label>City</label>
          <input value={city} onChange={e=>setCity(e.target.value)} />
        </div>
   <div className="input-group">
          <label>Description</label>
          <textarea rows="3" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>
         <button className="primary" onClick={submit}>Submit</button>
      </div>
    </>
  );
}
export default MaintenanceRequest;