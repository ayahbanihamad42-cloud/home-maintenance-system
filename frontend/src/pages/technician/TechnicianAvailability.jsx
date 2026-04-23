import { useEffect, useState } from "react";
import API from "../../services/api";
import Header from "../../components/common/Header";

function TechnicianAvailability() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [technicianId, setTechnicianId] = useState(null);
  const [technicianStatus, setTechnicianStatus] = useState("loading");

  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    day: "",
    start_time: "",
    end_time: ""
  });

  useEffect(() => {
    if (!user?.id) return;

    setTechnicianStatus("loading");

    API.get(`/technicians/user/${user.id}`)
      .then((res) => {
        setTechnicianId(res.data.technicianId);
        setTechnicianStatus("ready");
        setMessage(null);
      })
      .catch(() => {
        setTechnicianId(null);
        setTechnicianStatus("error");
      });
  }, [user?.id]);

  const submit = async () => {
    if (!form.day || !form.start_time || !form.end_time) {
      setMessage({
        type: "warning",
        title: "Notice",
        body: "Please choose a date and time range."
      });
      return;
    }

    if (!technicianId && technicianStatus === "error") {
      setMessage({
        type: "error",
        title: "Notice",
        body: "Technician profile not found. Please contact the admin."
      });
      return;
    }

    try {
      await API.post("/technicians/availability", {
        ...(technicianId ? { technician_id: technicianId } : {}),
        ...form
      });

      setMessage({
        type: "success",
        title: "Saved Successfully",
        body: "Availability saved and email notification was sent."
      });

      setForm({
        day: "",
        start_time: "",
        end_time: ""
      });
    } catch (error) {
      setMessage({
        type: "error",
        title: "Notice",
        body: error.response?.data?.message || "Failed to save availability."
      });
    }
  };

  return (
    <>
      <Header />

      <div className="container">
        <h2 className="section-title">Set Availability</h2>

        {message ? (
          <div className={`message-box-card availability-message-box ${message.type}`}>
            <div className="message-box-title">{message.title}</div>
            <div className="message-box-body">{message.body}</div>
          </div>
        ) : null}

        <div className="panel">
          <div className="input-group">
            <label>Date</label>
            <input
              type="date"
              value={form.day}
              onChange={e => setForm({ ...form, day: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Start Time</label>
            <input
              type="time"
              value={form.start_time}
              onChange={e => setForm({ ...form, start_time: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>End Time</label>
            <input
              type="time"
              value={form.end_time}
              onChange={e => setForm({ ...form, end_time: e.target.value })}
            />
          </div>

          <button className="primary" onClick={submit}>
            Save
          </button>
        </div>
      </div>
    </>
  );
}

export default TechnicianAvailability;