/**
 * TechnicianAvailability Page
 * ---------------------------
 * Technician defines working hours per day
 */

import { useState } from "react";
import API from "../../services/api";
import Header from "../../components/common/Header";

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
    <>
      <Header />
      <div className="container">
        <h2 className="section-title">Set Availability</h2>

        <div className="panel">
          <div className="input-group">
            <label>Date</label>
            <input type="date" onChange={e=>setForm({...form,day:e.target.value})}/>
          </div>
          <div className="input-group">
            <label>Start Time</label>
            <input type="time" onChange={e=>setForm({...form,start_time:e.target.value})}/>
          </div>
          <div className="input-group">
            <label>End Time</label>
            <input type="time" onChange={e=>setForm({...form,end_time:e.target.value})}/>
          </div>

          <button className="primary" onClick={submit}>Save</button>
        </div>
      </div>
    </>
  );
}

export default TechnicianAvailability;
