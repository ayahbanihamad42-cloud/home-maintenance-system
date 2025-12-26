/**
 * TechnicianAvailability Page
 * ---------------------------
 * Technician defines working hours per day
 */

import { useState } from "react";
import API from "../../services/api";

function TechnicianAvailability() {
  const [form, setForm] = useState({
    day: "",
    start_time: "",
    end_time: ""
  });

  const submit = async () => {
    await API.post("/technicians/availability", {
      technician_id: JSON.parse(localStorage.getItem("user")).id,
      ...form
    });

    alert("Availability saved");
  };

  return (
    <div className="container">
      <h2>Set Availability</h2>

      <input type="date" onChange={e=>setForm({...form,day:e.target.value})}/>
      <input type="time" onChange={e=>setForm({...form,start_time:e.target.value})}/>
      <input type="time" onChange={e=>setForm({...form,end_time:e.target.value})}/>

      <button className="primary" onClick={submit}>Save</button>
    </div>
  );
}

export default TechnicianAvailability;
