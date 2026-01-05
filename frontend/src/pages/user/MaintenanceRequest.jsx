/**
 * MaintenanceRequest Page (Improved)
 * --------------------------------
 * Fetches available time slots dynamically
 */

import { useState, useEffect } from "react";
import API from "../../services/api";
function MaintenanceRequest() {
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");

  useEffect(() => {
    if (date) {
      API.get(`/technicians/1/availability?date=${date}`)
        .then(res => setSlots(res.data));
    }
  }, [date]);

  return (
    <div className="container">
      <h2>Maintenance Request</h2>

      <input type="date" onChange={e=>setDate(e.target.value)} />

      <select onChange={e=>setTime(e.target.value)}>
        <option>Select time</option>
        {slots.map(t => (
          <option key={t}>{t}</option>
        ))}
      </select>

      <button className="primary">Submit</button>
    </div>
  );
}

export default MaintenanceRequest;
 