import React, { useEffect, useState } from "react";
import Header from "../../components/common/Header";
import API from "../../services/api.jsx";
import {
  getMyRegularAvailability,
  createRegularAvailability,
  deleteRegularAvailability,
} from "../../services/technicianService";

const days = [
  "All",
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function TechnicianAvailability() {
  const [mode, setMode] = useState("one-time");
  const [availability, setAvailability] = useState([]);
  const [regularAvailability, setRegularAvailability] = useState([]);

  const [availableDate, setAvailableDate] = useState("");
  const [monthStart, setMonthStart] = useState("");
  const [monthEnd, setMonthEnd] = useState("");
  const [dayOfWeek, setDayOfWeek] = useState("All");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [slotMinutes, setSlotMinutes] = useState("60");

  const [message, setMessage] = useState("");
  const [saving, setSaving] = useState(false);

  const loadOneTime = async () => {
    try {
      const res = await API.get("/technicians/availability/my");
      setAvailability(Array.isArray(res.data) ? res.data : []);
    } catch {
      setAvailability([]);
    }
  };

  const loadRegular = async () => {
    try {
      const data = await getMyRegularAvailability();
      setRegularAvailability(Array.isArray(data) ? data : []);
    } catch {
      setRegularAvailability([]);
    }
  };

  useEffect(() => {
    loadOneTime();
    loadRegular();
  }, []);

  const resetForm = () => {
    setAvailableDate("");
    setMonthStart("");
    setMonthEnd("");
    setDayOfWeek("All");
    setStartTime("");
    setEndTime("");
    setSlotMinutes("60");
  };

  const saveAvailability = async (e) => {
    e.preventDefault();

    if (!startTime || !endTime) {
      setMessage("Start time and end time are required.");
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      if (mode === "one-time") {
        if (!availableDate) {
          setMessage("Date is required.");
          return;
        }

        await API.post("/technicians/availability", {
          available_date: availableDate,
          start_time: startTime,
          end_time: endTime,
        });

        await loadOneTime();
      } else {
        if (!monthStart || !monthEnd) {
          setMessage("Month start and month end are required.");
          return;
        }

        await createRegularAvailability({
          month_start: monthStart,
          month_end: monthEnd,
          day_of_week: dayOfWeek,
          start_time: startTime,
          end_time: endTime,
          slot_minutes: Number(slotMinutes),
        });

        await loadRegular();
      }

      resetForm();
      setMessage("Availability saved successfully.");
    } catch (err) {
      setMessage(err?.response?.data?.message || "Failed to save availability.");
    } finally {
      setSaving(false);
    }
  };

  const deleteOneTime = async (id) => {
    await API.delete(`/technicians/availability/${id}`);
    await loadOneTime();
  };

  const deleteRegular = async (id) => {
    await deleteRegularAvailability(id);
    await loadRegular();
  };

  return (
    <>
      <Header />

      <main className="availability-container">
        <section className="page-hero">
          <h1>Technician Availability</h1>
          <p>Set your working hours and manage available booking times.</p>
        </section>

        {message ? (
          <div className={message.toLowerCase().includes("failed") ? "auth-error" : "auth-success"}>
            {message}
          </div>
        ) : null}

        <section className="availability-tabs">
          <button
            type="button"
            className={mode === "one-time" ? "primary" : "secondary-btn"}
            onClick={() => {
              setMode("one-time");
              resetForm();
              setMessage("");
            }}
          >
            One-Time Availability
          </button>

          <button
            type="button"
            className={mode === "regular" ? "primary" : "secondary-btn"}
            onClick={() => {
              setMode("regular");
              resetForm();
              setMessage("");
            }}
          >
            Regular Monthly Schedule
          </button>
        </section>

        <section className="form-card">
          <form className="availability-form" onSubmit={saveAvailability}>
            {mode === "regular" ? (
              <>
                <div>
                  <label>Month Start</label>
                  <input
                    type="date"
                    value={monthStart}
                    onChange={(e) => setMonthStart(e.target.value)}
                  />
                </div>

                <div>
                  <label>Month End</label>
                  <input
                    type="date"
                    value={monthEnd}
                    onChange={(e) => setMonthEnd(e.target.value)}
                  />
                </div>

                <div>
                  <label>Day Of Week</label>
                  <select
                    value={dayOfWeek}
                    onChange={(e) => setDayOfWeek(e.target.value)}
                  >
                    {days.map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : (
              <div>
                <label>Date</label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                />
              </div>
            )}

            <div>
              <label>Start Time</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <label>End Time</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            {mode === "regular" && (
              <div>
                <label>Each Request Duration</label>
                <select
                  value={slotMinutes}
                  onChange={(e) => setSlotMinutes(e.target.value)}
                >
                  <option value="30">30 minutes</option>
                  <option value="60">1 hour</option>
                  <option value="90">1.5 hours</option>
                  <option value="120">2 hours</option>
                  <option value="180">3 hours</option>
                </select>
              </div>
            )}

            <button className="primary" type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Availability"}
            </button>
          </form>
        </section>

        <section className="availability-list">
          {mode === "one-time" ? (
            <>
              <h2 className="section-title">One-Time Availability</h2>

              {availability.length === 0 ? (
                <article className="availability-card">
                  <h3>No availability added.</h3>
                  <p>Your saved one-time availability will appear here.</p>
                </article>
              ) : (
                availability.map((item) => (
                  <article className="availability-card" key={item.id}>
                    <div className="request-details-grid">
                      <p>
                        <strong>Date:</strong>{" "}
                        {String(item.available_date || "").slice(0, 10)}
                      </p>
                      <p>
                        <strong>Time:</strong> {item.start_time} - {item.end_time}
                      </p>
                    </div>

                    <button
                      className="danger-btn"
                      type="button"
                      onClick={() => deleteOneTime(item.id)}
                    >
                      Delete
                    </button>
                  </article>
                ))
              )}
            </>
          ) : (
            <>
              <h2 className="section-title">Regular Monthly Schedule</h2>

              {regularAvailability.length === 0 ? (
                <article className="availability-card">
                  <h3>No regular schedule added.</h3>
                  <p>Your saved regular schedule will appear here.</p>
                </article>
              ) : (
                regularAvailability.map((item) => (
                  <article className="availability-card" key={item.id}>
                    <div className="request-details-grid">
                      <p>
                        <strong>Month:</strong>{" "}
                        {String(item.month_start).slice(0, 10)} →{" "}
                        {String(item.month_end).slice(0, 10)}
                      </p>
                      <p>
                        <strong>Day:</strong> {item.day_of_week}
                      </p>
                      <p>
                        <strong>Time:</strong> {item.start_time} - {item.end_time}
                      </p>
                      <p>
                        <strong>Each Request:</strong> {item.slot_minutes} minutes
                      </p>
                    </div>

                    <button
                      className="danger-btn"
                      type="button"
                      onClick={() => deleteRegular(item.id)}
                    >
                      Delete
                    </button>
                  </article>
                ))
              )}
            </>
          )}
        </section>
      </main>
    </>
  );
}

export default TechnicianAvailability;