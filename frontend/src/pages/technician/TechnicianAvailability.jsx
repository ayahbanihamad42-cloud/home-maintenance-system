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

      <div className="container">
        <div className="panel" style={{ maxWidth: 900, margin: "40px auto" }}>
          <h2>Technician Availability</h2>

          {message ? <div className="mini-error">{message}</div> : null}

          <div style={{ display: "flex", gap: 12, marginBottom: 22 }}>
            <button
              type="button"
              className={mode === "one-time" ? "primary" : "btn-outline"}
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
              className={mode === "regular" ? "primary" : "btn-outline"}
              onClick={() => {
                setMode("regular");
                resetForm();
                setMessage("");
              }}
            >
              Regular Monthly Schedule
            </button>
          </div>

          <form onSubmit={saveAvailability}>
            {mode === "regular" ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                  <div className="input-group">
                    <label>Month Start</label>
                    <input
                      type="date"
                      value={monthStart}
                      onChange={(e) => setMonthStart(e.target.value)}
                    />
                  </div>

                  <div className="input-group">
                    <label>Month End</label>
                    <input
                      type="date"
                      value={monthEnd}
                      onChange={(e) => setMonthEnd(e.target.value)}
                    />
                  </div>
                </div>

                <div className="input-group">
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
              <div className="input-group">
                <label>Date</label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                />
              </div>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <div className="input-group">
                <label>Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label>End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
            </div>

            {mode === "regular" && (
              <div className="input-group">
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

          <hr style={{ margin: "28px 0", borderColor: "#d8c8b8" }} />

          {mode === "one-time" ? (
            <>
              <h3>One-Time Availability</h3>

              {availability.length === 0 ? (
                <div className="empty-gallery-card">No availability added.</div>
              ) : (
                <div className="history-list">
                  {availability.map((item) => (
                    <div className="history-card" key={item.id}>
                      <p><b>Date:</b> {String(item.available_date || "").slice(0, 10)}</p>
                      <p><b>Time:</b> {item.start_time} - {item.end_time}</p>

                      <button className="btn-outline" onClick={() => deleteOneTime(item.id)}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <h3>Regular Monthly Schedule</h3>

              {regularAvailability.length === 0 ? (
                <div className="empty-gallery-card">No regular schedule added.</div>
              ) : (
                <div className="history-list">
                  {regularAvailability.map((item) => (
                    <div className="history-card" key={item.id}>
                      <p><b>Month:</b> {String(item.month_start).slice(0, 10)} → {String(item.month_end).slice(0, 10)}</p>
                      <p><b>Day:</b> {item.day_of_week}</p>
                      <p><b>Time:</b> {item.start_time} - {item.end_time}</p>
                      <p><b>Each Request:</b> {item.slot_minutes} minutes</p>

                      <button className="btn-outline" onClick={() => deleteRegular(item.id)}>
                        Delete
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}

export default TechnicianAvailability;