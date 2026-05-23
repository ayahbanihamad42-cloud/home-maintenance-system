import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../../components/common/Header";

import { createMaintenanceRequest } from "../../services/maintenanceService";
import { getTechnicianById, getAvailability } from "../../services/technicianService";

function MaintenanceRequest() {
  const navigate = useNavigate();
  const { technicianId } = useParams();
  const location = useLocation();

  const stateTech = location.state?.technician || location.state?.tech || {};
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    service: location.state?.service || stateTech.service || "",
    technician_name: location.state?.technicianName || stateTech.name || "",
    scheduled_date: "",
    scheduled_time: "",
    estimated_hours: "1",
    payment_method: "cash",
    location_note: "",
    description: "",
    price_per_hour: location.state?.price_per_hour || stateTech.price_per_hour || 0,
  });

  const totalPrice = useMemo(() => {
    return (
      Number(form.price_per_hour || 0) * Number(form.estimated_hours || 1)
    ).toFixed(2);
  }, [form.price_per_hour, form.estimated_hours]);

  const normalizeDate = (value) => {
    if (!value) return "";

    const raw = String(value);

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const d = new Date(value);

    if (!Number.isNaN(d.getTime())) {
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${yyyy}-${mm}-${dd}`;
    }

    return raw.slice(0, 10);
  };

  const normalizeTime = (value) => {
    if (!value) return "";
    return String(value).slice(0, 8);
  };

  useEffect(() => {
    const loadTechnician = async () => {
      try {
        if (!technicianId) return;

        const tech = await getTechnicianById(technicianId);

        setForm((prev) => ({
          ...prev,
          service: prev.service || tech.service || "",
          technician_name: prev.technician_name || tech.name || "",
          price_per_hour: prev.price_per_hour || tech.price_per_hour || 0,
        }));
      } catch (err) {
        console.error("load technician error:", err);
      }
    };

    loadTechnician();
  }, [technicianId]);

  useEffect(() => {
    const loadDates = async () => {
      try {
        setMessage(null);

        const data = await getAvailability(technicianId);
        const list = Array.isArray(data) ? data : [];

        const dates = [
          ...new Set(
            list
              .filter((x) => Number(x.is_booked) !== 1 && x.is_booked !== true)
              .map((x) => normalizeDate(x.available_date))
              .filter(Boolean)
          ),
        ];

        setAvailableDates(dates);

        setForm((prev) => ({
          ...prev,
          scheduled_date: dates[0] || "",
          scheduled_time: "",
        }));
      } catch (err) {
        console.error("load dates error:", err);
        setAvailableDates([]);
        setAvailableTimes([]);
        setMessage({
          type: "error",
          title: "Error",
          body: "Failed to load available dates and times.",
        });
      }
    };

    if (technicianId) loadDates();
  }, [technicianId]);

  useEffect(() => {
    const loadTimes = async () => {
      try {
        if (!technicianId || !form.scheduled_date) {
          setAvailableTimes([]);
          return;
        }

        const data = await getAvailability(technicianId, form.scheduled_date);
        const list = Array.isArray(data) ? data : [];

        const times = list
          .filter((x) => Number(x.is_booked) !== 1 && x.is_booked !== true)
          .map((x) => ({
            id: x.id,
            value: normalizeTime(x.start_time),
            label: `${normalizeTime(x.start_time)} - ${normalizeTime(x.end_time)}`,
          }));

        setAvailableTimes(times);

        setForm((prev) => ({
          ...prev,
          scheduled_time: times[0]?.value || "",
        }));
      } catch (err) {
        console.error("load times error:", err);
        setAvailableTimes([]);
        setForm((prev) => ({ ...prev, scheduled_time: "" }));
      }
    };

    loadTimes();
  }, [technicianId, form.scheduled_date]);

  const checkSlotStillAvailable = async () => {
    const data = await getAvailability(technicianId, form.scheduled_date);
    const list = Array.isArray(data) ? data : [];

    return list.some(
      (x) =>
        Number(x.is_booked) !== 1 &&
        x.is_booked !== true &&
        normalizeDate(x.available_date) === form.scheduled_date &&
        normalizeTime(x.start_time) === normalizeTime(form.scheduled_time)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage(null);

      if (!form.scheduled_date || !form.scheduled_time) {
        setMessage({
          type: "error",
          title: "Unavailable Time",
          body: "Please choose an available date and time.",
        });
        return;
      }

      const stillAvailable = await checkSlotStillAvailable();

      if (!stillAvailable) {
        setMessage({
          type: "error",
          title: "Unavailable Time",
          body: "This date and time are already booked. Please choose another slot.",
        });
        return;
      }

      if (!form.description.trim()) {
        setMessage({
          type: "error",
          title: "Error",
          body: "Please enter description.",
        });
        return;
      }

      const payload = {
        user_id: user.id,
        technician_id: technicianId,
        service: form.service,
        service_type: form.service,
        description: form.description,
        city: user.city || "",
        location: form.location_note,
        location_note: form.location_note,
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        estimated_hours: Number(form.estimated_hours || 1),
        payment_method: form.payment_method,
        price_per_hour: Number(form.price_per_hour || 0),
        total_price: Number(totalPrice),
      };

      const res = await createMaintenanceRequest(payload);
      const requestId = res.requestId || res.id;

      if (form.payment_method === "online") {
        navigate("/payment", {
          state: {
            requestId,
            amount: Number(totalPrice),
            technicianId,
            estimated_hours: Number(form.estimated_hours || 1),
          },
        });
      } else {
        navigate(`/review/${requestId}`);
      }
    } catch (err) {
      console.error("submit request error:", err);

      setMessage({
        type: "error",
        title: "Error",
        body:
          err.response?.data?.message ||
          "This time slot is no longer available. Please choose another time.",
      });
    }
  };

  return (
    <>
      <Header />

      <div className="container request-container">
        <h2>Maintenance Request</h2>

        {message && (
          <div className={`message-box-card ${message.type}`}>
            <div className="message-box-title">{message.title}</div>
            <div className="message-box-body">{message.body}</div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="request-grid">
            <div className="input-group">
              <label>Service</label>
              <input value={form.service} readOnly />
            </div>

            <div className="input-group">
              <label>Technician</label>
              <input value={form.technician_name} readOnly />
            </div>

            <div className="input-group">
              <label>Date</label>
              <select
                value={form.scheduled_date}
                onChange={(e) =>
                  setForm({
                    ...form,
                    scheduled_date: e.target.value,
                    scheduled_time: "",
                  })
                }
              >
                {availableDates.length === 0 ? (
                  <option value="">No available dates</option>
                ) : (
                  availableDates.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="input-group">
              <label>Time Slot</label>
              <select
                value={form.scheduled_time}
                onChange={(e) =>
                  setForm({ ...form, scheduled_time: e.target.value })
                }
              >
                {availableTimes.length === 0 ? (
                  <option value="">No available times</option>
                ) : (
                  availableTimes.map((time) => (
                    <option key={time.id || time.value} value={time.value}>
                      {time.label}
                    </option>
                  ))
                )}
              </select>
            </div>

            <div className="input-group">
              <label>Estimated Hours</label>
              <input
                type="number"
                min="1"
                value={form.estimated_hours}
                onChange={(e) =>
                  setForm({ ...form, estimated_hours: e.target.value })
                }
              />
            </div>

            <div className="input-group">
              <label>Payment Method</label>
              <select
                value={form.payment_method}
                onChange={(e) =>
                  setForm({ ...form, payment_method: e.target.value })
                }
              >
                <option value="cash">Cash</option>
                <option value="online">Online</option>
              </select>
            </div>

            <div className="input-group full-width">
              <label>Price Summary</label>
              <input
                readOnly
                value={`Price / hour: ${Number(form.price_per_hour || 0).toFixed(
                  2
                )} JOD | Estimated Hours: ${
                  form.estimated_hours
                } | Total: ${totalPrice} JOD`}
              />
            </div>

            <div className="input-group full-width">
              <label>Location Note</label>
              <input
                value={form.location_note}
                onChange={(e) =>
                  setForm({ ...form, location_note: e.target.value })
                }
                placeholder="Example: Irbid, near Yarmouk University"
              />
            </div>

            <div className="input-group full-width">
              <label>Description</label>
              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({ ...form, description: e.target.value })
                }
                placeholder="Describe the problem..."
              />
            </div>
          </div>

          <button className="primary" type="submit">
            {form.payment_method === "online"
              ? "Continue to Payment"
              : "Submit Request"}
          </button>
        </form>
      </div>
    </>
  );
}

export default MaintenanceRequest;