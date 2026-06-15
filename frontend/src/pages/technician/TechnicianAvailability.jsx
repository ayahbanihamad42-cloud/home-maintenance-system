import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();
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
      setMessage(t("techAvailability.startEndRequired"));
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      if (mode === "one-time") {
        if (!availableDate) {
          setMessage(t("techAvailability.dateRequired"));
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
          setMessage(t("techAvailability.monthStartEndRequired"));
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
      setMessage(t("techAvailability.savedSuccess"));
    } catch (err) {
      setMessage(err?.response?.data?.message || t("techAvailability.failedToSave"));
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
          <h1>{t("techAvailability.title")}</h1>
          <p>{t("techAvailability.subtitle")}</p>
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
            {t("techAvailability.oneTime")}
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
            {t("techAvailability.regularMonthly")}
          </button>
        </section>

        <section className="form-card">
          <form className="availability-form" onSubmit={saveAvailability}>
            {mode === "regular" ? (
              <>
                <div>
                  <label>{t("techAvailability.monthStart")}</label>
                  <input
                    type="date"
                    value={monthStart}
                    onChange={(e) => setMonthStart(e.target.value)}
                  />
                </div>

                <div>
                  <label>{t("techAvailability.monthEnd")}</label>
                  <input
                    type="date"
                    value={monthEnd}
                    onChange={(e) => setMonthEnd(e.target.value)}
                  />
                </div>

                <div>
                  <label>{t("techAvailability.dayOfWeek")}</label>
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
                <label>{t("techAvailability.date")}</label>
                <input
                  type="date"
                  value={availableDate}
                  onChange={(e) => setAvailableDate(e.target.value)}
                />
              </div>
            )}

            <div>
              <label>{t("techAvailability.startTime")}</label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>

            <div>
              <label>{t("techAvailability.endTime")}</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>

            {mode === "regular" && (
              <div>
                <label>{t("techAvailability.duration")}</label>
                <select
                  value={slotMinutes}
                  onChange={(e) => setSlotMinutes(e.target.value)}
                >
                  <option value="30">{t("techAvailability.min30")}</option>
                  <option value="60">{t("techAvailability.hour1")}</option>
                  <option value="90">{t("techAvailability.hour1_5")}</option>
                  <option value="120">{t("techAvailability.hour2")}</option>
                  <option value="180">{t("techAvailability.hour3")}</option>
                </select>
              </div>
            )}

            <button className="primary" type="submit" disabled={saving}>
              {saving ? t("techAvailability.saving") : t("techAvailability.saveAvailability")}
            </button>
          </form>
        </section>

        <section className="availability-list">
          {mode === "one-time" ? (
            <>
              <h2 className="section-title">{t("techAvailability.oneTime")}</h2>

              {availability.length === 0 ? (
                <article className="availability-card">
                  <h3>{t("techAvailability.noAvailability")}</h3>
                  <p>{t("techAvailability.availabilityWillAppear")}</p>
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
                      {t("techAvailability.delete")}
                    </button>
                  </article>
                ))
              )}
            </>
          ) : (
            <>
              <h2 className="section-title">{t("techAvailability.regularMonthly")}</h2>

              {regularAvailability.length === 0 ? (
                <article className="availability-card">
                  <h3>{t("techAvailability.noRegularSchedule")}</h3>
                  <p>{t("techAvailability.regularScheduleWillAppear")}</p>
                </article>
              ) : (
                regularAvailability.map((item) => (
                  <article className="availability-card" key={item.id}>
                    <div className="request-details-grid">
                      <p>
                        <strong>{t("techAvailability.monthLabel")}</strong>{" "}
                        {String(item.month_start).slice(0, 10)} →{" "}
                        {String(item.month_end).slice(0, 10)}
                      </p>
                      <p>
                        <strong>{t("techAvailability.dayLabel")}</strong> {item.day_of_week}
                      </p>
                      <p>
                        <strong>Time:</strong> {item.start_time} - {item.end_time}
                      </p>
                      <p>
                        <strong>{t("techAvailability.eachRequest")}</strong> {item.slot_minutes} {t("techAvailability.minutes")}
                      </p>
                    </div>

                    <button
                      className="danger-btn"
                      type="button"
                      onClick={() => deleteRegular(item.id)}
                    >
                      {t("techAvailability.delete")}
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