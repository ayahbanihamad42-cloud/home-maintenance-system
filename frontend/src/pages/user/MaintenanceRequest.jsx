import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/common/Header";
import {
  getTechnicians,
  getAvailability,
  getTechnicianProfile,
} from "../../services/technicianService";
import { createMaintenanceRequest } from "../../services/maintenanceService";
import { createMockPayment } from "../../services/paymentService";

function MaintenanceRequest() {
  const { technicianId: initialTechnicianId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState(initialTechnicianId || "");
  const [technicianName, setTechnicianName] = useState("");
  const [technicianPrice, setTechnicianPrice] = useState(0);

  const [availableDates, setAvailableDates] = useState([]);
  const [availabilityByDate, setAvailabilityByDate] = useState({});
  const [loadingDates, setLoadingDates] = useState(false);

  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [locationNote, setLocationNote] = useState("");

  const [estimatedHours, setEstimatedHours] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [geoCoords, setGeoCoords] = useState(null);
  const [geoError, setGeoError] = useState("");

  const [requestMessage, setRequestMessage] = useState(null);

  const totalPrice = useMemo(() => {
    return Number(technicianPrice || 0) * Number(estimatedHours || 1);
  }, [technicianPrice, estimatedHours]);

  const mapQuery = useMemo(() => {
    if (geoCoords) return `${geoCoords.lat},${geoCoords.lng}`;
    return encodeURIComponent(locationNote || "Amman");
  }, [geoCoords, locationNote]);

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const getNextDays = (count = 14) => {
    const days = [];

    for (let i = 0; i < count; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      days.push(formatDate(d));
    }

    return days;
  };

  useEffect(() => {
    if (!service || initialTechnicianId) return;

    getTechnicians(service)
      .then((data) => setTechnicians(data || []))
      .catch(() => setTechnicians([]));
  }, [service, initialTechnicianId]);

  useEffect(() => {
    if (!technicianId) {
      setTechnicianName("");
      setTechnicianPrice(0);
      setAvailableDates([]);
      setAvailabilityByDate({});
      setDate("");
      setSlots([]);
      setTime("");
      return;
    }

    getTechnicianProfile(technicianId)
      .then((res) => {
        setService(res?.service || "");
        setTechnicianName(res?.name || "");
        setTechnicianPrice(Number(res?.price_per_hour || 0));
      })
      .catch(() => {
        setTechnicianName("");
        setTechnicianPrice(0);
      });
  }, [technicianId]);

  useEffect(() => {
    if (!technicianId) return;

    const loadAvailableDates = async () => {
      try {
        setLoadingDates(true);
        setDate("");
        setSlots([]);
        setTime("");
        setRequestMessage(null);

        const days = getNextDays(14);
        const map = {};
        const validDates = [];

        for (const day of days) {
          try {
            const daySlots = await getAvailability(technicianId, day);

            if (Array.isArray(daySlots) && daySlots.length > 0) {
              map[day] = daySlots;
              validDates.push(day);
            }
          } catch (err) {
            console.error("Availability date error:", day, err);
          }
        }

        setAvailabilityByDate(map);
        setAvailableDates(validDates);

        if (validDates.length > 0) {
          setDate(validDates[0]);
          setSlots(map[validDates[0]] || []);
        } else {
          setDate("");
          setSlots([]);

          setRequestMessage({
            type: "warning",
            title: "Notice",
            body: "Technician is not available.",
          });
        }
      } catch (err) {
        console.error("Load available dates error:", err);

        setAvailableDates([]);
        setAvailabilityByDate({});
        setSlots([]);

        setRequestMessage({
          type: "error",
          title: "Notice",
          body: "Failed to load technician availability.",
        });
      } finally {
        setLoadingDates(false);
      }
    };

    loadAvailableDates();
  }, [technicianId]);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      setTime("");
      return;
    }

    setSlots(availabilityByDate[date] || []);
    setTime("");
  }, [date, availabilityByDate]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setGeoError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoCoords({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
        });
      },
      () => {
        setGeoError("Unable to access your location.");
      }
    );
  }, []);

  const submit = async () => {
    if (!service || !technicianId) {
      setRequestMessage({
        type: "warning",
        title: "Notice",
        body: "Please select Service and Technician.",
      });
      return;
    }

    if (!date) {
      setRequestMessage({
        type: "warning",
        title: "Notice",
        body: "Technician is not available.",
      });
      return;
    }

    if (!time) {
      setRequestMessage({
        type: "warning",
        title: "Notice",
        body: "Please select an available time.",
      });
      return;
    }

    if (!description.trim()) {
      setRequestMessage({
        type: "warning",
        title: "Notice",
        body: "Please describe the issue.",
      });
      return;
    }

    if (!estimatedHours || Number(estimatedHours) < 1) {
      setRequestMessage({
        type: "warning",
        title: "Notice",
        body: "Estimated hours must be at least 1.",
      });
      return;
    }

    const payload = {
      technician_id: technicianId,
      description: description.trim(),
      scheduled_date: date,
      scheduled_time: time,
      service,
      location_note: locationNote,
      city: "",
      estimated_hours: Number(estimatedHours),
      payment_method: paymentMethod,
    };

    try {
      if (paymentMethod === "online") {
        const paymentResponse = await createMockPayment({
          amount: totalPrice,
          technicianId: technicianId,
          estimated_hours: Number(estimatedHours),
        });

        const requestResponse = await createMaintenanceRequest({
          ...payload,
          payment_transaction_id: paymentResponse.transactionId,
        });

        if (requestResponse?.id) {
          navigate(`/payment-success/${requestResponse.id}`, {
            state: {
              requestId: requestResponse.id,
              transactionId: paymentResponse.transactionId,
              totalPrice,
            },
          });

          return;
        }

        setRequestMessage({
          type: "warning",
          title: "Notice",
          body: "Payment completed, but request id was not returned.",
        });

        return;
      }

      const response = await createMaintenanceRequest(payload);

      if (response?.id) {
        navigate(`/review/${response.id}`);
        return;
      }

      setRequestMessage({
        type: "warning",
        title: "Notice",
        body: "Request submitted, but no id returned.",
      });
    } catch (e) {
      console.error("submit request error:", e);

      setRequestMessage({
        type: "error",
        title: "Notice",
        body: e?.response?.data?.message || "Failed to submit request.",
      });
    }
  };

  return (
    <>
      <Header />

      <div className="container request-container">
        <h2>Maintenance Request</h2>

        {requestMessage ? (
          <div className={`message-box-card request-message-box ${requestMessage.type}`}>
            <div className="message-box-title">{requestMessage.title}</div>
            <div className="message-box-body">{requestMessage.body}</div>
          </div>
        ) : null}

        <div className="request-grid">
          {technicianId ? (
            <>
              <div className="input-group">
                <label>Service</label>
                <div className="readonly-field">{service || "Loading..."}</div>
              </div>

              <div className="input-group">
                <label>Technician</label>
                <div className="readonly-field">
                  {technicianName || "Loading..."}
                </div>
              </div>
            </>
          ) : (
            <>
              <div className="input-group">
                <label>Service Type</label>

                <select
                  value={service}
                  onChange={(e) => {
                    setService(e.target.value);
                    setTechnicianId("");
                    setTechnicianName("");
                    setTechnicianPrice(0);
                    setAvailableDates([]);
                    setAvailabilityByDate({});
                    setDate("");
                    setTime("");
                    setSlots([]);
                    setRequestMessage(null);
                  }}
                >
                  <option value="">Select service</option>
                  <option value="Electrical">Electrical</option>
                  <option value="Plumbing">Plumbing</option>
                  <option value="Painting">Painting</option>
                  <option value="Decoration">Decoration</option>
                </select>
              </div>

              <div className="input-group">
                <label>Technician</label>

                <select
                  value={technicianId}
                  onChange={(e) => {
                    setTechnicianId(e.target.value);
                    setDate("");
                    setTime("");
                    setSlots([]);
                    setAvailableDates([]);
                    setAvailabilityByDate({});
                    setRequestMessage(null);
                  }}
                >
                  <option value="">Select technician</option>

                  {technicians.map((tech) => (
                    <option key={tech.technicianId} value={tech.technicianId}>
                      {tech.name} - {tech.experience} yrs -{" "}
                      {Number(tech.price_per_hour || 0).toFixed(2)} JOD/hr
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="input-group">
            <label>Date</label>

            {loadingDates ? (
              <div className="readonly-field">Loading available dates...</div>
            ) : availableDates.length === 0 ? (
              <div className="readonly-field not-available-field">
                Technician is not available.
              </div>
            ) : (
              <select value={date} onChange={(e) => setDate(e.target.value)}>
                {availableDates.map((availableDate) => (
                  <option key={availableDate} value={availableDate}>
                    {availableDate}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="input-group">
            <label>Time Slot</label>

            {date && slots.length === 0 ? (
              <div className="readonly-field not-available-field">
                No available times for selected date.
              </div>
            ) : (
              <select
                value={time}
                onChange={(e) => setTime(e.target.value)}
                disabled={!date}
              >
                <option value="">Select time</option>

                {slots.map((slot) => (
                  <option key={slot.id || slot.start_time} value={slot.start_time}>
                    {slot.start_time}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="input-group">
            <label>Estimated Hours</label>

            <input
              type="number"
              min="1"
              value={estimatedHours}
              onChange={(e) => setEstimatedHours(e.target.value)}
            />
          </div>

          <div className="input-group">
            <label>Payment Method</label>

            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
            >
              <option value="cash">Cash</option>
              <option value="online">Online</option>
            </select>
          </div>

          <div className="input-group full-width">
            <label>Price Summary</label>

            <div className="readonly-field">
              Price / hour: {Number(technicianPrice || 0).toFixed(2)} JOD |
              Estimated Hours: {estimatedHours} | Total:{" "}
              {Number(totalPrice).toFixed(2)} JOD
            </div>
          </div>

          <div className="input-group full-width">
            <label>Location Note</label>

            <input
              placeholder="Add address details or landmark"
              value={locationNote}
              onChange={(e) => setLocationNote(e.target.value)}
            />
          </div>

          <div className="input-group full-width">
            <label>Description</label>

            <textarea
              rows="3"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue"
            />
          </div>

          <div className="input-group full-width">
            <label>Map Location</label>

            {geoError ? (
              <div className="message-box-card compact-message-card warning">
                <div className="message-box-title">Notice</div>
                <div className="message-box-body">{geoError}</div>
              </div>
            ) : null}

            <div className="map-embed">
              <iframe
                title="map"
                src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>

        <button
          className="primary"
          onClick={submit}
          disabled={!technicianId || loadingDates || availableDates.length === 0}
        >
          {paymentMethod === "online" ? "Pay & Submit" : "Submit"}
        </button>
      </div>
    </>
  );
}

export default MaintenanceRequest;