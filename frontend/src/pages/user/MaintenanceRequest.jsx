import React, { useState, useEffect } from "react";
import { createMaintenance } from "../../services/maintenanceService";

function MaintenanceRequest() {
  const [form, setForm] = useState({
    service: "",
    city: "",
    description: "",
    date: "",
    time: "",
    location: { lat: "", lng: "" }
  });

  // 📍 جلب الموقع تلقائياً عند فتح الصفحة
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          setForm(prev => ({
            ...prev,
            location: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          }));
        },
        err => {
          console.error("Error getting location:", err);
        }
      );
    }
  }, []);

  const submit = async e => {
    e.preventDefault();
    if (!form.date || !form.time) {
      alert("Please select date and time");
      return;
    }
    await createMaintenance(form);
    alert("Request submitted");
  };

  return (
    <div className="container">
      <h2>Maintenance Request</h2>

      <form onSubmit={submit}>
        <input
          placeholder="Service"
          onChange={e => setForm({ ...form, service: e.target.value })}
          required
        />

        <input
          placeholder="City"
          onChange={e => setForm({ ...form, city: e.target.value })}
          required
        />

        <textarea
          placeholder="Description"
          onChange={e => setForm({ ...form, description: e.target.value })}
          required
        />

        <label>
          Date:
          <input
            type="date"
            value={form.date}
            onChange={e => setForm({ ...form, date: e.target.value })}
            required
          />
        </label>

        <label>
          Time:
          <input
            type="time"
            value={form.time}
            onChange={e => setForm({ ...form, time: e.target.value })}
            required
          />
        </label>

        {/* عرض الإحداثيات للمستخدم */}
        <p>
          Your location: {form.location.lat} , {form.location.lng}
        </p>

        <button className="primary" type="submit">Submit</button>
      </form>
    </div>
  );
}

export default MaintenanceRequest;
