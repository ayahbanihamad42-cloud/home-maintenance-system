import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Header from "../../components/common/Header";
import { createMaintenanceRequest } from "../../services/maintenanceService.jsx";
import {
  getTechnicianById,
  getAvailability,
} from "../../services/technicianService.jsx";

function MaintenanceRequest() {
  const navigate = useNavigate();
  const params = useParams();
  const location = useLocation();

  const stateTech = location.state?.technician || location.state?.tech || {};

  const selectedTechnicianId =
    params.technicianId ||
    location.state?.technicianId ||
    location.state?.technician_id ||
    stateTech.technicianId ||
    stateTech.technician_id ||
    stateTech.id ||
    "";

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [availableTimes, setAvailableTimes] = useState([]);
  const [message, setMessage] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [timesLoading, setTimesLoading] = useState(false);

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

  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 45; i += 1) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);

      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");

      dates.push(`${year}-${month}-${day}`);
    }

    return dates;
  }, []);

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

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const normalMatch = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (normalMatch) return normalMatch[1];

    return raw.slice(0, 10);
  };

  const normalizeTime = (value) => {
    if (!value) return "";

    const raw = String(value).trim();
    const match = raw.match(/^(\d{2}:\d{2})(:\d{2})?/);

    if (match) {
      return match[0].length === 5 ? `${match[0]}:00` : match[0];
    }

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
    let ignore = false;

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

        if (ignore) return;

        setForm((prev) => ({
          ...prev,
          service: prev.service || tech.service || "",
          technician_name: prev.technician_name || tech.name || "",
          price_per_hour: prev.price_per_hour || tech.price_per_hour || 0,
        }));
      } catch (err) {
        if (ignore) return;

        console.error("load technician error:", err);
        setMessage({
          type: "error",
          title: "Error",
          body: "Failed to load technician information.",
        });
      }
    };

    loadTechnician();

    return () => {
      ignore = true;
    };
  }, [selectedTechnicianId]);

  useEffect(() => {
    let ignore = false;

    const loadTimes = async () => {
      try {
        setAvailableTimes([]);

        if (!selectedTechnicianId || !form.scheduled_date) {
          setForm((prev) => ({ ...prev, scheduled_time: "" }));
          return;
        }

        setTimesLoading(true);
        setMessage(null);

        const data = await getAvailability(
          selectedTechnicianId,
          form.scheduled_date
        );

        if (ignore) return;

        const list = Array.isArray(data) ? data : [];

        const times = list
          .filter((x) => !isBooked(x))
          .filter(
            (x) => normalizeDate(x.available_date) === form.scheduled_date
          )
          .map((x) => {
            const start = normalizeTime(x.start_time);
            const end = normalizeTime(x.end_time);

            return {
              id: x.id || `${form.scheduled_date}-${start}`,
              value: start,
              label: end ? `${start} - ${end}` : start,
            };
          })
          .filter((x) => x.value);

        const uniqueTimes = [];
        const seen = new Set();

        for (const time of times) {
          if (!seen.has(time.value)) {
            seen.add(time.value);
            uniqueTimes.push(time);
          }
        }

        setAvailableTimes(uniqueTimes);

        setForm((prev) => ({
          ...prev,
          scheduled_time: uniqueTimes[0]?.value || "",
        }));

        if (uniqueTimes.length === 0) {
          setMessage({
            type: "error",
            title: "No Available Times",
            body: "No available times were found for this date. Please choose another date.",
          });
        }
      } catch (err) {
        if (ignore) return;

        console.error("load times error:", err);
        setAvailableTimes([]);
        setForm((prev) => ({ ...prev, scheduled_time: "" }));
        setMessage({
          type: "error",
          title: "Error",
          body:
            err.response?.data?.message ||
            "Failed to load available times for this date.",
        });
      } finally {
        if (!ignore) {
          setTimesLoading(false);
        }
      }
    };

    loadTimes();

    return () => {
      ignore = true;
    };
  }, [selectedTechnicianId, form.scheduled_date]);

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

      if (!form.scheduled_date) {
        setMessage({
          type: "error",
          title: "Missing Date",
          body: "Please choose a date.",
        });
        return;
      }

      if (!form.scheduled_time) {
        setMessage({
          type: "error",
          title: "Unavailable Time",
          body: "Please choose an available time.",
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

      const selectedTimeExists = availableTimes.some(
        (time) => normalizeTime(time.value) === normalizeTime(form.scheduled_time)
      );

      if (!selectedTimeExists) {
        setMessage({
          type: "error",
          title: "Unavailable Time",
          body: "Please choose one of the available times.",
        });
        return;
      }

      const payload = {
        user_id: user.id,
        technician_id: selectedTechnicianId,
        service: form.service,
        service_type: form.service,
        description: form.description.trim(),
        city: user.city || "",
        location: form.location_note,
        location_note: form.location_note,
        scheduled_date: String(form.scheduled_date).trim(),
        scheduled_time: normalizeTime(form.scheduled_time),
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

      <main className="request-container">
        <section className="page-hero">
          <h1>Maintenance Request</h1>
          <p>
            Choose an available time, share your location, and submit your
            request.
          </p>
        </section>

        <section className="form-card">
          {message && (
            <div
              className={
                message.type === "error" ? "auth-error" : "auth-success"
              }
            >
              <strong>{message.title}</strong>
              <div>{message.body}</div>
            </div>
          )}

          <form className="form-container" onSubmit={handleSubmit}>
            <div className="form-row">
              <div>
                <label>Service</label>
                <input value={form.service} readOnly />
              </div>

              <div>
                <label>Technician</label>
                <input value={form.technician_name} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div>
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
                  <option value="">Choose a date</option>
                  {dateOptions.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Time Slot</label>
                <select
                  value={form.scheduled_time}
                  disabled={!form.scheduled_date || timesLoading}
                  onChange={(e) =>
                    setForm({ ...form, scheduled_time: e.target.value })
                  }
                >
                  {!form.scheduled_date ? (
                    <option value="">Choose a date first</option>
                  ) : timesLoading ? (
                    <option value="">Loading available times...</option>
                  ) : availableTimes.length === 0 ? (
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

              <div>
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
            </div>

            <div className="form-row">
              <div>
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

              <div>
                <label>Price Summary</label>
                <input
                  value={`${Number(form.price_per_hour || 0).toFixed(
                    2
                  )} JOD/hour | Hours: ${
                    form.estimated_hours
                  } | Total: ${totalPrice} JOD`}
                  readOnly
                />
              </div>
            </div>

            <label>Location Note</label>
            <input
              value={form.location_note}
              onChange={(e) =>
                setForm({ ...form, location_note: e.target.value })
              }
              placeholder="Example: Irbid, near Yarmouk University"
            />

            <button
              className="secondary-btn"
              type="button"
              onClick={getCurrentUserLocation}
              disabled={locationLoading}
            >
              {locationLoading ? "Getting Location..." : "Use My Location"}
            </button>

            {userLocation && (
              <div className="map-card">
                <h3>Your Request Location</h3>
                <iframe
                  title="user-location"
                  src={userMapSrc}
                  width="100%"
                  height="230"
                  style={{ border: 0 }}
                  loading="lazy"
                />
                <p>This static location will be shared with the technician.</p>
              </div>
            )}

            <label>Description</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder="Describe the problem..."
              rows="5"
            />

            <button
              className="primary"
              type="submit"
              disabled={timesLoading}
            >
              {form.payment_method === "online"
                ? "Continue to Payment"
                : "Submit Request"}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

export default MaintenanceRequest;