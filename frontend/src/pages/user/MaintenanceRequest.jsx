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
    return encodeURIComponent(locationNote || "Riyadh");
  }, [geoCoords, locationNote]);

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
    if (!date || !technicianId) {
      setSlots([]);
      setTime("");
      return;
    }

    getAvailability(technicianId, date)
      .then((data) => {
        const availableSlots = data || [];
        setSlots(availableSlots);
        setTime("");

        if (availableSlots.length === 0) {
          setRequestMessage({
            type: "warning",
            title: "Notice",
            body: "No availability for the selected date.",
          });
        } else {
          setRequestMessage(null);
        }
      })
      .catch(() => {
        setSlots([]);
        setTime("");
        setRequestMessage({
          type: "error",
          title: "Notice",
          body: "Failed to load availability for the selected date.",
        });
      });
  }, [date, technicianId]);

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
    if (!service || !technicianId || !date || !time) {
      setRequestMessage({
        type: "warning",
        title: "Notice",
        body: "Please fill Service, Technician, Date, and Time.",
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
      description,
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
                    setTime("");
                    setSlots([]);
                    setRequestMessage(null);
                  }}
                >
                  <option value="">Select technician</option>
                  {technicians.map((tech) => (
                    <option key={tech.technicianId} value={tech.technicianId}>
                      {tech.name} - {tech.experience} yrs - {Number(tech.price_per_hour || 0).toFixed(2)} JOD/hr
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="input-group">
            <label>Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
              }}
            />
          </div>

          <div className="input-group">
            <label>Time Slot</label>
            <select value={time} onChange={(e) => setTime(e.target.value)}>
              <option value="">
                {slots.length ? "Select time" : "No available times"}
              </option>
              {slots.map((slot) => (
                <option key={slot.id} value={slot.start_time}>
                  {slot.start_time}
                </option>
              ))}
            </select>
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
              Price / hour: {Number(technicianPrice || 0).toFixed(2)} JOD | Estimated Hours: {estimatedHours} | Total: {Number(totalPrice).toFixed(2)} JOD
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

        <button className="primary" onClick={submit}>
          {paymentMethod === "online" ? "Pay & Submit" : "Submit"}
        </button>
      </div>
    </>
  );
}

export default MaintenanceRequest;