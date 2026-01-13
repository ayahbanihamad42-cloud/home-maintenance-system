import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRequestById } from "../../services/maintenanceService";
import { getRatingByRequest, submitRating } from "../../services/ratingService";
import Header from "../../components/common/Header";
import API from "../../services/api";
import proileimage from "../../images/profileaht.png";
<image></image>
function ReviewRequest() {
  const { requestId } = useParams();
  const [req, setReq] = useState(null);
  const [technicianName, setTechnicianName] = useState("");
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    getRequestById(requestId).then(data => setReq(data));
  }, [requestId]);

  useEffect(() => {
    getRatingByRequest(requestId)
      .then((data) => {
        if (data) {
          setExistingRating(data);
          setRating(data.rating);
          setComment(data.comment || "");
        }
      })
      .catch(() => {
        setExistingRating(null);
      });
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
            <span style={{ flex: 1 }}><img src={proileimage} alt="Technician" style={{ width: '30px', height: '30px', borderRadius: '50%', marginRight: '10px' }} />Technician: {technicianName || "Assigned technician"}</span>
            <button className="primary-btn" style={{ padding: '5px 15px' }}>Chat</button>
          </div>

          <div className="timeline">
            <div className="timeline-item active">Request Accepted</div>
            <div className="timeline-item">On The Way</div>
            <div className="timeline-item">Service in Progress</div>
            <div className="timeline-item">Completed</div>
          </div>

          <div style={{ textAlign: "center", marginTop: "20px" }}>
            <p>Rate your experience:</p>
            <select
              value={rating}
              onChange={(e) => setRating(Number(e.target.value))}
              style={{ padding: "8px", borderRadius: "8px" }}
              disabled={Boolean(existingRating)}
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  {value} Stars
                </option>
              ))}
            </select>
            <textarea
              placeholder="Leave a comment..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              style={{ width: "100%", marginTop: "10px", borderRadius: "10px", padding: "10px" }}
              disabled={Boolean(existingRating)}
            />
            {submitMessage ? <p>{submitMessage}</p> : null}
            <button
              className="primary-btn"
              style={{ width: "100%", marginTop: "10px" }}
              disabled={Boolean(existingRating)}
              onClick={() => {
                if (!req?.technician_id) return;
                submitRating({
                  technician_id: req.technician_id,
                  request_id: req.id,
                  rating,
                  comment
                })
                  .then(() => {
                    setSubmitMessage("Review submitted.");
                    setExistingRating({ rating, comment });
                  })
                  .catch(() => {
                    setSubmitMessage("Failed to submit review.");
                  });
              }}
            >
              Submit Review
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
export default ReviewRequest;
