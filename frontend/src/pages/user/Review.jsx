import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRequestById } from "../../services/maintenanceService";
import Header from "../../components/common/Header";
import API from "../../services/api";

function ReviewRequest() {
  const { requestId } = useParams();
  const [req, setReq] = useState(null);
  const [technicianName, setTechnicianName] = useState("");

  useEffect(() => {
    getRequestById(requestId).then(data => setReq(data));
  }, [requestId]);

  useEffect(() => {
    if (!req?.technician_id) return;
    API.get(`/technicians/${req.technician_id}`)
      .then((res) => setTechnicianName(res.data.name))
      .catch(() => setTechnicianName(""));
  }, [req]);

  if (!req) return <p>Loading...</p>;

  return (
    <>
      <Header />
      <div className="container">
        <div className="glass-card">
          <h3>Request ID: #{req.id}</h3>
          <p><b>Service Type:</b> {req.service || "Not specified"}</p>
          <p><b>Date:</b> {req.scheduled_date || "Not specified"}</p>
          <p><b>Time:</b> {req.scheduled_time || "Not specified"}</p>
          <p><b>Location:</b> {req.location_note || "Not specified"}</p>
          <p><b>Description:</b> {req.description || "Not specified"}</p>
          
          <div style={{ display: 'flex', alignItems: 'center', background: '#cfd8dc', padding: '10px', borderRadius: '10px', margin: '15px 0' }}>
            <span style={{ flex: 1 }}>👤 Technician: {technicianName || "Assigned technician"}</span>
            <button className="primary-btn" style={{ padding: '5px 15px' }}>Chat</button>
          </div>

          <div className="timeline">
            <div className="timeline-item active">Request Accepted</div>
            <div className="timeline-item">On The Way</div>
            <div className="timeline-item">Service in Progress</div>
            <div className="timeline-item">Completed</div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <p>Rate your experience:</p>
            <div style={{ fontSize: '25px', color: '#f1c40f' }}>⭐⭐⭐⭐⭐</div>
            <textarea placeholder="Leave a comment..." style={{ width: '100%', marginTop: '10px', borderRadius: '10px', padding: '10px' }} />
            <button className="primary-btn" style={{ width: '100%', marginTop: '10px' }}>Submit Review</button>
          </div>
        </div>
      </div>
    </>
  );
}
export default ReviewRequest;
