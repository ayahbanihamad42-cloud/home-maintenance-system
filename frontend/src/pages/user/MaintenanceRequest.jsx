import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
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
  const { t } = useTranslation();

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
        title: t("request.locationError"),
        body: t("request.geolocationNotSupported"),
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
          title: t("request.locationAdded"),
          body: t("request.locationAddedBody"),
        });

        setLocationLoading(false);
      },
      () => {
        setMessage({
          type: "error",
          title: t("request.locationError"),
          body: t("request.locationAccessDenied"),
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
            title: t("request.missingTechnician"),
            body: t("request.chooseTechnicianFirst"),
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
          title: t("request.error"),
          body: t("request.failedToLoadTechnician"),
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
            title: t("request.noAvailableTimes"),
            body: t("request.noTimesFoundBody"),
          });
        }
      } catch (err) {
        if (ignore) return;

        console.error("load times error:", err);
        setAvailableTimes([]);
        setForm((prev) => ({ ...prev, scheduled_time: "" }));
        setMessage({
          type: "error",
          title: t("request.error"),
          body:
            err.response?.data?.message ||
            t("request.failedToLoadTimes"),
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
          title: t("request.missingTechnician"),
          body: t("request.chooseTechnicianFirst"),
        });
        return;
      }

      if (!form.scheduled_date) {
        setMessage({
          type: "error",
          title: t("request.missingDate"),
          body: t("request.pleaseChooseDate"),
        });
        return;
      }

      if (!form.scheduled_time) {
        setMessage({
          type: "error",
          title: t("request.unavailableTime"),
          body: t("request.pleaseChooseTime"),
        });
        return;
      }

      if (!form.description.trim()) {
        setMessage({
          type: "error",
          title: t("request.error"),
          body: t("request.pleaseEnterDescription"),
        });
        return;
      }

      const selectedTimeExists = availableTimes.some(
        (time) => normalizeTime(time.value) === normalizeTime(form.scheduled_time)
      );

      if (!selectedTimeExists) {
        setMessage({
          type: "error",
          title: t("request.unavailableTime"),
          body: t("request.pleaseChooseAvailableTime"),
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
        title: t("request.error"),
        body:
          err.response?.data?.message ||
          t("request.timeSlotUnavailable"),
      });
    }
  };

  return (
    <>
      <Header />

      <main className="request-container">
        <section className="page-hero">
          <h1>{t("request.title")}</h1>
          <p>
            {t("request.subtitle")}
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
                <label>{t("request.service")}</label>
                <input value={form.service} readOnly />
              </div>

              <div>
                <label>{t("request.technician")}</label>
                <input value={form.technician_name} readOnly />
              </div>
            </div>

            <div className="form-row">
              <div>
                <label>{t("request.date")}</label>
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
                  <option value="">{t("request.chooseDatePlaceholder")}</option>
                  {dateOptions.map((date) => (
                    <option key={date} value={date}>
                      {date}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>{t("request.timeSlot")}</label>
                <select
                  value={form.scheduled_time}
                  disabled={!form.scheduled_date || timesLoading}
                  onChange={(e) =>
                    setForm({ ...form, scheduled_time: e.target.value })
                  }
                >
                  {!form.scheduled_date ? (
                    <option value="">{t("request.chooseDateFirst")}</option>
                  ) : timesLoading ? (
                    <option value="">{t("request.loadingTimes")}</option>
                  ) : availableTimes.length === 0 ? (
                    <option value="">{t("request.noAvailableTimes")}</option>
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
                <label>{t("request.estimatedHours")}</label>
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
                <label>{t("request.paymentMethod")}</label>
                <select
                  value={form.payment_method}
                  onChange={(e) =>
                    setForm({ ...form, payment_method: e.target.value })
                  }
                >
                  <option value="cash">{t("request.cash")}</option>
                  <option value="online">{t("request.online")}</option>
                </select>
              </div>

              <div>
                <label>{t("request.priceSummary")}</label>
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

            <label>{t("request.locationNote")}</label>
            <input
              value={form.location_note}
              onChange={(e) =>
                setForm({ ...form, location_note: e.target.value })
              }
              placeholder={t("request.locationPlaceholder")}
            />

            <button
              className="secondary-btn"
              type="button"
              onClick={getCurrentUserLocation}
              disabled={locationLoading}
            >
              {locationLoading ? t("request.gettingLocation") : t("request.useMyLocation")}
            </button>

            {userLocation && (
              <div className="map-card">
                <h3>{t("request.yourRequestLocation")}</h3>
                <iframe
                  title="user-location"
                  src={userMapSrc}
                  width="100%"
                  height="230"
                  style={{ border: 0 }}
                  loading="lazy"
                />
                <p>{t("request.locationStaticNote")}</p>
              </div>
            )}

            <label>{t("request.description")}</label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
              placeholder={t("request.descriptionPlaceholder")}
              rows="5"
            />

            <button
              className="primary"
              type="submit"
              disabled={timesLoading}
            >
              {form.payment_method === "online"
                ? t("request.continueToPayment")
                : t("request.submitRequest")}
            </button>
          </form>
        </section>
      </main>
    </>
  );
}

export default MaintenanceRequest;