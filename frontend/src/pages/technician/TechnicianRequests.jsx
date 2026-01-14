/**
 * TechnicianRequests Page
 * Displays assigned maintenance requests
 */

import { useEffect, useState } from "react";
// React hooks

import API from "../../services/api";
// Axios API instance

import Header from "../../components/common/Header";
// Header component

// Technician assigned requests page
function TechnicianRequests() {

  // Store assigned maintenance requests
  const [requests, setRequests] = useState([]);

  // Get logged-in user ID from localStorage
  const userId = JSON.parse(localStorage.getItem("user")).id;

  // Store technician ID
  const [technicianId, setTechnicianId] = useState(null);

  // Fetch technician ID using user ID
  useEffect(() => {

    // Request technician profile
    API.get(`/technicians/user/${userId}`)
      .then((res) => setTechnicianId(res.data.technicianId))
      .catch(() => setTechnicianId(null));

  }, [userId]);

  // Fetch assigned requests using technician ID
  useEffect(() => {

    // Stop if technician ID is not available
    if (!technicianId) return;

    // Request technician maintenance requests
    API.get(`/technicians/${technicianId}/requests`)
      .then(res => setRequests(res.data));

  }, [technicianId]);

  return (
    <>
      {/* Page header */}
      <Header />

      <div className="container">

        {/* Page title */}
        <h2 className="section-title">Assigned Requests</h2>

        <div className="panel">

          {/* Render each request card */}
          {requests.map(r => {

            // Prepare Google Maps query
            const mapQuery = r.location_note
              ? encodeURIComponent(r.location_note)
              : "Riyadh";

            return (
              <div key={r.id} className="card">

                {/* Request details */}
                <p><b>Service:</b> {r.service}</p>
                <p><b>Status:</b> {r.status}</p>
                <p><b>Date:</b> {r.scheduled_date}</p>
                <p><b>Time:</b> {r.scheduled_time}</p>
                <p><b>Location:</b> {r.location_note || "Not provided"}</p>
                <p><b>Issue:</b> {r.description || "Not provided"}</p>

                {/* Embedded Google Map */}
                <div className="map-embed">
                  <iframe
                    title={`request-${r.id}-map`}
                    src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>

                {/* Request action buttons */}
                <div className="request-actions">

                  {/* Confirm request */}
                  <button
                    className="primary"
                    type="button"
                    onClick={() =>
                      API.patch(`/maintenance/${r.id}/status`, { status: "confirmed" })
                        .then(() =>
                          setRequests((prev) =>
                            prev.map((item) =>
                              item.id === r.id
                                ? { ...item, status: "confirmed" }
                                : item
                            )
                          )
                        )
                    }
                  >
                    Confirm
                  </button>

                  {/* Mark request as completed */}
                  <button
                    className="secondary"
                    type="button"
                    onClick={() =>
                      API.patch(`/maintenance/${r.id}/status`, { status: "completed" })
                        .then(() =>
                          setRequests((prev) =>
                            prev.map((item) =>
                              item.id === r.id
                                ? { ...item, status: "completed" }
                                : item
                            )
                          )
                        )
                    }
                  >
                    Mark Completed
                  </button>

                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}

// Export component
export default TechnicianRequests;
