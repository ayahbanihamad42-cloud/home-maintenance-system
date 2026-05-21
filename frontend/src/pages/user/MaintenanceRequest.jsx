import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../../components/common/Header";
import API from "../../services/api";

function MaintenanceRequest() {
  const { technicianId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const passedTech = location.state?.technician || null;

  const [tech, setTech] = useState(passedTech);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    service: passedTech?.service || "",
    technician_name: passedTech?.name || "",
    scheduled_date: "",
    scheduled_time: "",
    estimated_hours: "1",
    payment_method: "cash",
    location_note: "",
    description: "",
  });

  const toSqlDate = (value) => {
    if (!value) return "";

    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;

    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
  };

  const normalizeTime = (value) => {
    if (!value) return "";
    return String(value).split(".")[0];
  };

  const slotStartTime = (slot) => {
    if (!slot) return "";
    return normalizeTime(String(slot).split(" - ")[0]);
  };

  const selectedSlotObj = useMemo(() => {
    return availableSlots.find(
      (slot) =>
        toSqlDate(slot.date) === toSqlDate(form.scheduled_date) &&
        slot.label === form.scheduled_time
    );
  }, [availableSlots, form.scheduled_date, form.scheduled_time]);

  const dates = useMemo(() => {
    const unique = new Set();

    availableSlots.forEach((slot) => {
      if (slot?.date) unique.add(toSqlDate(slot.date));
    });

    return Array.from(unique).sort();
  }, [availableSlots]);

  const timesForSelectedDate = useMemo(() => {
    return availableSlots.filter(
      (slot) => toSqlDate(slot.date) === toSqlDate(form.scheduled_date)
    );
  }, [availableSlots, form.scheduled_date]);

  const pricePerHour = Number(tech?.price_per_hour || 0);
  const estimatedHours = Number(form.estimated_hours || 1);
  const totalPrice = pricePerHour * estimatedHours;

  useEffect(() => {
    const loadTechnician = async () => {
      try {
        if (passedTech) {
          setTech(passedTech);
          return;
        }

        const res = await API.get(`/technicians/${technicianId}`);
        setTech(res.data);
      } catch (err) {
        console.error("load technician error:", err);
        setMessage({
          type: "error",
          title: "Error",
          body: "Failed to load technician details.",
        });
      }
    };

    if (technicianId) loadTechnician();
  }, [technicianId, passedTech]);

  useEffect(() => {
    if (!tech) return;

    setForm((prev) => ({
      ...prev,
      service: tech.service || prev.service || "",
      technician_name: tech.name || prev.technician_name || "",
    }));
  }, [tech]);

  useEffect(() => {
    const loadSlots = async () => {
      try {
        const res = await API.get(`/technicians/${technicianId}/available-slots`);

        const slots = Array.isArray(res.data) ? res.data : [];

        const cleanSlots = slots
          .map((slot) => ({
            ...slot,
            date: toSqlDate(slot.date || slot.scheduled_date),
            label:
              slot.label ||
              `${normalizeTime(slot.start_time)} - ${normalizeTime(slot.end_time)}`,
            start_time: normalizeTime(slot.start_time),
            end_time: normalizeTime(slot.end_time),
          }))
          .filter((slot) => slot.date && slot.label);

        setAvailableSlots(cleanSlots);

        if (cleanSlots.length > 0) {
          setForm((prev) => ({
            ...prev,
            scheduled_date: prev.scheduled_date || cleanSlots[0].date,
            scheduled_time: prev.scheduled_time || cleanSlots[0].label,
          }));
        }
      } catch (err) {
        console.error("load slots error:", err);
        setAvailableSlots([]);
        setMessage({
          type: "error",
          title: "Error",
          body: "Failed to load available dates and times.",
        });
      }
    };

    if (technicianId) loadSlots();
  }, [technicianId]);

  const handleDateChange = (value) => {
    const date = toSqlDate(value);
    const firstSlot = availableSlots.find((slot) => toSqlDate(slot.date) === date);

    setForm((prev) => ({
      ...prev,
      scheduled_date: date,
      scheduled_time: firstSlot?.label || "",
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.scheduled_date || !form.scheduled_time) {
      setMessage({
        type: "error",
        title: "Missing Date Or Time",
        body: "Please choose an available date and time.",
      });
      return;
    }

    if (!selectedSlotObj) {
      setMessage({
        type: "error",
        title: "Unavailable Time",
        body: "This date and time are not available. Please choose another slot.",
      });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const payload = {
        technician_id: Number(technicianId),
        service: form.service,
        description: form.description,
        scheduled_date: toSqlDate(form.scheduled_date),
        scheduled_time: slotStartTime(form.scheduled_time),
        estimated_hours: estimatedHours,
        payment_method: form.payment_method,
        location_note: form.location_note,
        total_price: totalPrice,
      };

      const res = await API.post("/maintenance", payload);

      const newRequestId = res.data?.id || res.data?.request_id;

      if (!newRequestId) {
        setMessage({
          type: "success",
          title: "Request Created",
          body: "Request created successfully.",
        });
        return;
      }

      navigate(`/review/${newRequestId}`, {
        state: {
          createdRequest: {
            ...payload,
            id: newRequestId,
            service: form.service,
            technician_name: form.technician_name,
            created_at: new Date().toISOString(),
          },
        },
      });
    } catch (err) {
      console.error("create request error:", err);

      const backendMessage =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Failed to create request.";

      setMessage({
        type: "error",
        title:
          backendMessage.toLowerCase().includes("duplicate") ||
          backendMessage.toLowerCase().includes("available") ||
          backendMessage.toLowerCase().includes("booked")
            ? "Unavailable Time"
            : "Error",
        body:
          backendMessage.toLowerCase().includes("duplicate")
            ? "This date and time are already booked. Please choose another slot."
            : backendMessage,
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />

      <div className="container request-container">
        <h2>Maintenance Request</h2>

        {message && (
          <div className={`message-box-card ${message.type} request-message-card`}>
            <div className="message-box-title">{message.title}</div>
            <div className="message-box-body">{message.body}</div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="request-grid">
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
              onChange={(e) => handleDateChange(e.target.value)}
            >
              {dates.length === 0 ? (
                <option value="">No available dates</option>
              ) : (
                dates.map((date) => (
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
                setForm((prev) => ({
                  ...prev,
                  scheduled_time: e.target.value,
                }))
              }
            >
              {timesForSelectedDate.length === 0 ? (
                <option value="">No available times</option>
              ) : (
                timesForSelectedDate.map((slot) => (
                  <option key={`${slot.date}-${slot.label}`} value={slot.label}>
                    {slot.label}
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
                setForm((prev) => ({
                  ...prev,
                  estimated_hours: e.target.value,
                }))
              }
            />
          </div>

          <div className="input-group">
            <label>Payment Method</label>
            <select
              value={form.payment_method}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  payment_method: e.target.value,
                }))
              }
            >
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div className="input-group full-width">
            <label>Price Summary</label>
            <div className="readonly-field">
              Price / hour: {pricePerHour.toFixed(2)} JOD | Estimated Hours:{" "}
              {estimatedHours || 1} | Total: {totalPrice.toFixed(2)} JOD
            </div>
          </div>

          <div className="input-group full-width">
            <label>Location Note</label>
            <input
              value={form.location_note}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  location_note: e.target.value,
                }))
              }
              placeholder="Example: Irbid, near Yarmouk University"
            />
          </div>

          <div className="input-group full-width">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  description: e.target.value,
                }))
              }
              placeholder="Describe the problem..."
            />
          </div>

          <button className="primary" type="submit" disabled={submitting}>
            {submitting ? "Submitting..." : "Submit Request"}
          </button>
        </form>
      </div>
    </>
  );
}

export default MaintenanceRequest;