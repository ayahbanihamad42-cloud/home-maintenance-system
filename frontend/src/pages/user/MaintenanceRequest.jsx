import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../../components/common/Header";
import { getTechnicians, getAvailability } from "../../services/technicianService";
import { createMaintenanceRequest } from "../../services/maintenanceService";
import API from "../../services/api";

function MaintenanceRequest() {
  const { technicianId: initialTechnicianId } = useParams();
  const navigate = useNavigate();
  const [service, setService] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState(initialTechnicianId || "");
  const [technicianName, setTechnicianName] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [geoCoords, setGeoCoords] = useState(null);
  const [geoError, setGeoError] = useState("");

  const mapQuery = useMemo(() => {
    if (geoCoords) {
      return `${geoCoords.lat},${geoCoords.lng}`;
    }
    return encodeURIComponent(locationNote || "Riyadh");
  }, [geoCoords, locationNote]);

  useEffect(() => {
    if (!service) return;
    getTechnicians(service).then((data) => setTechnicians(data));
  }, [service]);

  useEffect(() => {
    if (!technicianId) {
      setTechnicianName("");
      return;
    }
    API.get(`/technicians/${technicianId}`)
      .then((res) => {
        setService(res.data.service);
        setTechnicianName(res.data.name);
      })
      .catch(() => {
        setTechnicianName("");
      });
  }, [technicianId]);

  useEffect(() => {
    if (date && technicianId) {
      getAvailability(technicianId, date)
        .then((data) => setSlots(data));
    }
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
          lng: pos.coords.longitude
        });
      },
      () => {
        setGeoError("Unable to access your location.");
      }
    );
  }, []);

  const submit = async () => {
    if (!service || !technicianId || !date || !time) return;
    const response = await createMaintenanceRequest({
      technician_id: technicianId,
      description,
      scheduled_date: date,
      scheduled_time: time,
      service,
      location_note: locationNote,
      city: ""
    });
    if (response?.id) {
      navigate(`/review/${response.id}`);
      return;
    }
    alert("Request submitted");
  };

  return (
    <>
      <Header />
      <div className="container">
        <h2>Maintenance Request</h2>

        {technicianId ? (
          <div className="input-group">
            <label>Service</label>
            <div className="readonly-field">{service || "Loading..."}</div>
            <label>Technician</label>
            <div className="readonly-field">{technicianName || "Loading..."}</div>
          </div>
        ) : (
          <>
            <div className="input-group">
              <label>Service Type</label>
              <select value={service} onChange={(e) => setService(e.target.value)}>
                <option value="">Select service</option>
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Painting">Painting</option>
                <option value="Decoration">Decoration</option>
              </select>
            </div>

            <div className="input-group">
              <label>Technician</label>
              <select value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}>
                <option value="">Select technician</option>
                {technicians.map((tech) => (
                  <option key={tech.technicianId} value={tech.technicianId}>
                    {tech.name} - {tech.experience} yrs
                  </option>
                ))}
              </select>
            </div>
          </>
        )}

        <div className="input-group">
          <label>Date</label>
          <input type="date" onChange={e=>setDate(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Time Slot</label>
          <select value={time} onChange={e=>setTime(e.target.value)}>
            <option value="">Select time</option>
            {slots.map(slot => (
              <option key={slot.id} value={slot.start_time}>
                {slot.start_time}
              </option>
            ))}
          </select>
        </div>

        <div className="input-group">
          <label>Location Note</label>
          <input
            placeholder="Add address details or landmark"
            value={locationNote}
            onChange={e=>setLocationNote(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>Description</label>
          <textarea rows="3" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>

        <div className="input-group">
          <label>Map Location</label>
          {geoError ? <p className="helper-text">{geoError}</p> : null}
          <div className="map-embed">
            <iframe
              title="map"
              src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>

        <button className="primary" onClick={submit}>Submit</button>
      </div>
    </>
  );
}

export default MaintenanceRequest;
