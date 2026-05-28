import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../../components/common/Header";

import { createMaintenanceRequest } from "../../services/maintenanceService";
import {
  getTechnicianById,
  getAvailability,
} from "../../services/technicianService";

function MaintenanceRequest() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const stateTech = location.state?.technician || location.state?.tech || {};
  const selectedTechnicianId =
    params.technicianId ||
    location.state?.technicianId ||
    stateTech.technicianId ||
    stateTech.technician_id ||
    stateTech.id ||
    "";

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [message, setMessage] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [form, setForm] = useState({
    service: location.state?.service || stateTech.service || "",
    technician_name: location.state?.technicianName || stateTech.name || "",
    scheduled_date: "",
    scheduled_time: "",
    estimated_hours: "1",
    payment_method: "cash",
    location_note: "",
    description: "",
    price_per_hour:
      location.state?.price_per_hour || stateTech.price_per_hour || 0,
  });

  const totalPrice = useMemo(() => {
    return (
      Number(form.price_per_hour || 0) * Number(form.estimated_hours || 1)
    ).toFixed(2);
  }, [form.price_per_hour, form.estimated_hours]);

  const userMapSrc = userLocation
    ? `https://www.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=17&output=embed`
    : "";

  const isBooked = (item) => {
    return (
      Number(item?.is_booked) === 1 ||
      item?.is_booked === true ||
      String(item?.is_booked).toLowerCase() === "true"
    );
  };

  const normalizeDate = (value) => {
    if (!value) return "";

    const raw = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw;
    }

    const normalMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (normalMatch) return normalMatch[1];

    return raw.slice(0, 10);
  };

  const normalizeTime = (value) => {
    if (!value) return "";

    const raw = String(value).trim();

    const match = raw.match(/^(\d{2}:\d{2})(:\d{2})?/);
    if (match) return match[0].length === 5 ? `${match[0]}:00` : match[0];

    return raw.slice(0, 8);
  };

  const getCurrentUserLocation = () => {
    setLocationLoading(true);

    if (!navigator.geolocation) {
      setLocationLoading(false);
      setMessage({
        type: "error",
        title: "Location Error",
        body: "Geolocation is not supported by this browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;

        setUserLocation({
          lat,
          lng,
          url: `https://www.google.com/maps?q=${lat},${lng}`,
        });

        setMessage({
          type: "success",
          title: "Location Added",
          body: "Your location has been added to this request.",
        });

        setLocationLoading(false);
      },
      () => {
        setMessage({
          type: "error",
          title: "Location Error",
          body: "Please allow location access and try again.",
        });

        setLocationLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000,
      }
    );
  };

  useEffect(() => {
    const loadTechnician = async () => {
      try {
        if (!selectedTechnicianId) {
          setMessage({
            type: "error",
            title: "Missing Technician",
            body: "Please choose a technician first.",
          });
          return;
        }

        const tech = await getTechnicianById(selectedTechnicianId);

        setForm((prev) => ({
          ...prev,
          service: prev.service || tech.service || "",
          technician_name: prev.technician_name || tech.name || "",
          price_per_hour: prev.price_per_hour || tech.price_per_hour || 0,
        }));
      } catch (err) {
        console.error("load technician error:", err);
        setMessage({
          type: "error",
          title: "Error",
          body: "Failed to load technician information.",
        });
      }
    };

    loadTechnician();
  }, [selectedTechnicianId]);

  useEffect(() => {
    const loadDates = async () => {
      try {
        setMessage(null);

        if (!selectedTechnicianId) {
          setAvailableDates([]);
          setAvailableTimes([]);
          return;
        }

        const data = await getAvailability(selectedTechnicianId);
        const list = Array.isArray(data) ? data : [];

        const dates = [
          ...new Set(
            list
              .filter((x) => !isBooked(x))
              .map((x) => normalizeDate(x.available_date))
              .filter(Boolean)
          ),
        ].sort();

        setAvailableDates(dates);

        setForm((prev) => ({
          ...prev,
          scheduled_date: dates.includes(prev.scheduled_date)
            ? prev.scheduled_date
            : dates[0] || "",
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

    loadDates();
  }, [selectedTechnicianId]);

  useEffect(() => {
    const loadTimes = async () => {
      try {
        if (!selectedTechnicianId || !form.scheduled_date) {
          setAvailableTimes([]);
          setForm((prev) => ({ ...prev, scheduled_time: "" }));
          return;
        }

        const data = await getAvailability(
          selectedTechnicianId,
          form.scheduled_date
        );

        const list = Array.isArray(data) ? data : [];

        const times = list
          .filter((x) => !isBooked(x))
          .filter((x) => normalizeDate(x.available_date) === form.scheduled_date)
          .map((x) => ({
            id: x.id,
            value: normalizeTime(x.start_time),
            label: `${normalizeTime(x.start_time)} - ${normalizeTime(
              x.end_time
            )}`,
          }))
          .filter((x) => x.value);

        setAvailableTimes(times);

        setForm((prev) => ({
          ...prev,
          scheduled_time: times.some((t) => t.value === prev.scheduled_time)
            ? prev.scheduled_time
            : times[0]?.value || "",
        }));
      } catch (err) {
        console.error("load times error:", err);
        setAvailableTimes([]);
        setForm((prev) => ({ ...prev, scheduled_time: "" }));
      }
    };

    loadTimes();
  }, [selectedTechnicianId, form.scheduled_date]);

  const checkSlotStillAvailable = async () => {
    const data = await getAvailability(selectedTechnicianId, form.scheduled_date);
    const list = Array.isArray(data) ? data : [];

    return list.some(
      (x) =>
        !isBooked(x) &&
        normalizeDate(x.available_date) === form.scheduled_date &&
        normalizeTime(x.start_time) === normalizeTime(form.scheduled_time)
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setMessage(null);

      if (!selectedTechnicianId) {
        setMessage({
          type: "error",
          title: "Missing Technician",
          body: "Please choose a technician first.",
        });
        return;
      }

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

      const selectedDate = String(form.scheduled_date).trim();
      const selectedTime = normalizeTime(form.scheduled_time);

      const payload = {
        user_id: user.id,
        technician_id: selectedTechnicianId,
        service: form.service,
        service_type: form.service,
        description: form.description.trim(),
        city: user.city || "",
        location: form.location_note,
        location_note: form.location_note,
        scheduled_date: selectedDate,
        scheduled_time: selectedTime,
        estimated_hours: Number(form.estimated_hours || 1),
        payment_method: form.payment_method,
        price_per_hour: Number(form.price_per_hour || 0),
        total_price: Number(totalPrice),
        user_location_lat: userLocation?.lat || null,
        user_location_lng: userLocation?.lng || null,
        user_location_url: userLocation?.url || null,
      };

      const res = await createMaintenanceRequest(payload);
      const requestId = res.requestId || res.id;

      if (form.payment_method === "online") {
        navigate("/payment", {
          state: {
            requestId,
            amount: Number(totalPrice),
            technicianId: selectedTechnicianId,
            estimated_hours: Number(form.estimated_hours || 1),
          },
        });
      } else {
        navigate("/history");
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
          </div>

          <div className="input-group">
            <label>Price Summary</label>
            <input
              readOnly
              value={`${Number(form.price_per_hour || 0).toFixed(
                2
              )} JOD/hour | Hours: ${
                form.estimated_hours
              } | Total: ${totalPrice} JOD`}
            />
          </div>

          <div className="input-group">
            <label>Location Note</label>
            <input
              value={form.location_note}
              onChange={(e) =>
                setForm({ ...form, location_note: e.target.value })
              }
              placeholder="Example: Irbid, near Yarmouk University"
            />
          </div>

          <div style={{ marginTop: 18, marginBottom: 18 }}>
            <button
              className="secondary"
              type="button"
              onClick={getCurrentUserLocation}
              disabled={locationLoading}
            >
              {locationLoading ? "Getting Location..." : "Use My Location"}
            </button>

            {userLocation && (
              <div style={{ marginTop: 16 }}>
                <h3 style={{ marginBottom: 10 }}>Your Request Location</h3>

                <div
                  style={{
                    width: "100%",
                    height: 320,
                    borderRadius: 22,
                    overflow: "hidden",
                    border: "1px solid #d8c8b8",
                    background: "#f7efe7",
                  }}
                >
                  <iframe
                    title="User Request Location"
                    src={userMapSrc}
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                  />
                </div>

                <p
                  style={{
                    marginTop: 8,
                    fontWeight: 700,
                    color: "#5c5048",
                  }}
                >
                  This static location will be shared with the technician.
                </p>
              </div>
            )}
          </div>

          <div className="input-group">
            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe the problem..."
            />
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