// Import React hooks
import { useState, useEffect, useMemo } from "react";

// Import router hooks for navigation and URL params
import { useNavigate, useParams } from "react-router-dom";

// Import shared header component
import Header from "../../components/common/Header";

// Import technician and maintenance services
import { getTechnicians, getAvailability } from "../../services/technicianService";
import { createMaintenanceRequest } from "../../services/maintenanceService";

// Import API instance
import API from "../../services/api";

// Component for creating a new maintenance request
function MaintenanceRequest() {

  // Get technicianId from URL if provided
  const { technicianId: initialTechnicianId } = useParams();

  // Navigation hook
  const navigate = useNavigate();

  // Form and data states
  const [service, setService] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState(initialTechnicianId || "");
  const [technicianName, setTechnicianName] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [locationNote, setLocationNote] = useState("");

  // Geolocation states
  const [geoCoords, setGeoCoords] = useState(null);
  const [geoError, setGeoError] = useState("");

  // Build map query using coordinates if available, otherwise location note
  const mapQuery = useMemo(() => {
    if (geoCoords) {
      return `${geoCoords.lat},${geoCoords.lng}`;
    }
    return encodeURIComponent(locationNote || "Riyadh");
  }, [geoCoords, locationNote]);

  // Fetch technicians when service changes
  useEffect(() => {
    if (!service) return;

    getTechnicians(service).then((data) => setTechnicians(data));
  }, [service]);

  // Fetch technician details when technicianId changes
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

  // Fetch available time slots for selected technician and date
  useEffect(() => {
    if (date && technicianId) {
      getAvailability(technicianId, date)
        .then((data) => setSlots(data));
    }
  }, [date, technicianId]);

  // Get user's current location on component mount
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

  // Submit maintenance request
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

    // Navigate to review page if request is created successfully
    if (response?.id) {
      navigate(`/review/${response.id}`);
      return;
    }

    alert("Request submitted");
  };

  return (
    <>
      {/* Page header */}
      <Header />

      <div className="container">
        <h2>Maintenance Request</h2>

        {/* If technician is preselected, show readonly fields */}
        {technicianId ? (
          <div className="input-group">
            <label>Service</label>
            <div className="readonly-field">{service || "Loading..."}</div>

            <label>Technician</label>
            <div className="readonly-field">{technicianName || "Loading..."}</div>
          </div>
        ) : (
          <>
            {/* Service selection */}
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

            {/* Technician selection */}
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

        {/* Date selection */}
        <div className="input-group">
          <label>Date</label>
          <input type="date" onChange={e=>setDate(e.target.value)} />
        </div>

        {/* Time slot selection */}
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

        {/* Location notes */}
        <div className="input-group">
          <label>Location Note</label>
          <input
            placeholder="Add address details or landmark"
            value={locationNote}
            onChange={e=>setLocationNote(e.target.value)}
          />
        </div>

        {/* Problem description */}
        <div className="input-group">
          <label>Description</label>
          <textarea rows="3" value={description} onChange={e=>setDescription(e.target.value)} />
        </div>

        {/* Map preview */}
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

        {/* Submit button */}
        <button className="primary" onClick={submit}>Submit</button>
      </div>
    </>
  );
}

// Export component
export default MaintenanceRequest;
