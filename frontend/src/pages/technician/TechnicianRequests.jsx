/**
 * TechnicianRequests Page
 * Displays assigned maintenance requests
 */

import { useEffect, useState } from "react";
import API from "../../services/api";
import Header from "../../components/common/Header";

function TechnicianRequests() {
  const [requests, setRequests] = useState([]);
  const userId = JSON.parse(localStorage.getItem("user")).id;
  const [technicianId, setTechnicianId] = useState(null);

  useEffect(() => {
    API.get(`/technicians/user/${userId}`)
      .then((res) => setTechnicianId(res.data.technicianId))
      .catch(() => setTechnicianId(null));
  }, [userId]);

  useEffect(() => {
    if (!technicianId) return;
    API.get(`/technicians/${technicianId}/requests`)
      .then(res => setRequests(res.data));
  }, [technicianId]);

  return (
    <>
      <Header />
      <div className="container">
        <h2 className="section-title">Assigned Requests</h2>

        <div className="panel">
          {requests.map(r => {
            const mapQuery = r.location_note
              ? encodeURIComponent(r.location_note)
              : "Riyadh";

            return (
            <div key={r.id} className="card">
              <p><b>Service:</b> {r.service}</p>
              <p><b>Status:</b> {r.status}</p>
              <p><b>Date:</b> {r.scheduled_date}</p>
              <p><b>Time:</b> {r.scheduled_time}</p>
              <p><b>Location:</b> {r.location_note || "Not provided"}</p>
              <p><b>Issue:</b> {r.description || "Not provided"}</p>
              <div className="map-embed">
                <iframe
                  title={`request-${r.id}-map`}
                  src={`https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="request-actions">
                <button
                  className="primary"
                  type="button"
                  onClick={() =>
                    API.patch(`/maintenance/${r.id}/status`, { status: "confirmed" })
                      .then(() =>
                        setRequests((prev) =>
                          prev.map((item) =>
                            item.id === r.id ? { ...item, status: "confirmed" } : item
                          )
                        )
                      )
                  }
                >
                  Confirm
                </button>
                <button
                  className="secondary"
                  type="button"
                  onClick={() =>
                    API.patch(`/maintenance/${r.id}/status`, { status: "completed" })
                      .then(() =>
                        setRequests((prev) =>
                          prev.map((item) =>
                            item.id === r.id ? { ...item, status: "completed" } : item
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

export default TechnicianRequests;
