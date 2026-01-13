/**
 * TechnicianAvailability Page
 * ---------------------------
 * Technician defines working hours per day
 */

import { useEffect, useState } from "react";
import API from "../../services/api";
import Header from "../../components/common/Header";

function TechnicianAvailability() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [technicianId, setTechnicianId] = useState(null);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({
    day: "",
    start_time: "",
    end_time: ""
  });

  useEffect(() => {
    if (!user?.id) return;
    API.get(`/technicians/user/${user.id}`)
      .then((res) => setTechnicianId(res.data.technicianId))
      .catch(() => setMessage("Unable to load technician profile."));
  }, [user?.id]);

  const submit = async () => {
    if (!technicianId) {
      setMessage("Technician profile not available.");
      return;
    }
    if (!form.day || !form.start_time || !form.end_time) {
      setMessage("Please choose a date and time range.");
      return;
    }

    try {
      await API.post("/technicians/availability", {
        technician_id: technicianId,
        ...form
      });
      setMessage("Availability saved");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to save availability.");
    }
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

          {message ? <p className="helper-text">{message}</p> : null}
          <button className="primary" onClick={submit}>Save</button>
        </div>
      </div>
    </>
  );
}

export default TechnicianAvailability;
