// Import React hooks
import React, { useEffect, useMemo, useState } from "react";

// Import router hooks
import { useNavigate, useParams } from "react-router-dom";

// Import services for maintenance requests and ratings
import { getRequestById } from "../../services/maintenanceService";
import { getRatingByRequest, submitRating } from "../../services/ratingService";

// Import shared header
import Header from "../../components/common/Header";

// Import API instance
import API from "../../services/api";

// Component to review a maintenance request
function ReviewRequest() {
  // Get requestId from URL
  const { requestId } = useParams();

  // State to store request details
  const [req, setReq] = useState(null);

  // Technician related states
  const [technicianName, setTechnicianName] = useState("");
  const [technicianUserId, setTechnicianUserId] = useState(null);

  // Rating form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");

  // Store existing rating if already submitted
  const [existingRating, setExistingRating] = useState(null);

  // Navigation hook
  const navigate = useNavigate();

  // Fetch maintenance request details
  useEffect(() => {
    getRequestById(requestId)
      .then((data) => setReq(data))
      .catch(() => setReq(null));
  }, [requestId]);

  // Fetch existing rating for this request (if any)
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

  // Fetch technician details based on technician_id
  useEffect(() => {
    if (!req?.technician_id) return;

    API.get(`/technicians/${req.technician_id}`)
      .then((res) => {
        setTechnicianName(res.data?.name || "");
        setTechnicianUserId(res.data?.user_id || null);
      })
      .catch(() => {
        setTechnicianName("");
        setTechnicianUserId(null);
      });
  }, [req?.technician_id]);

  // Timeline steps shown to the user
  const timelineSteps = useMemo(
    () => ["Request Accepted", "On The Way", "Service in Progress", "Completed"],
    []
  );

  // Determine which timeline step is active based on request status
  const activeIndex = useMemo(() => {
    const statusMap = {
      pending: -1,
      confirmed: 0,
      on_the_way: 1,
      in_progress: 2,
      completed: 3
    };

    const normalizedStatus = String(req?.status || "").trim().toLowerCase();
    return statusMap[normalizedStatus] ?? -1;
  }, [req?.status]);

  // Check if request is completed
  const isCompleted =
    String(req?.status || "").trim().toLowerCase() === "completed";

  // Loading state
  if (!req) {
    return (
      <>
        <Header />
        <div className="container">
          <p>Loading...</p>
        </div>
      </>
    );
  }

  return (
    <>
      {/* Page header */}
      <Header />

      <div className="container">
        <div className="glass-card">
          {/* Request basic information */}
          <h3>Request ID: #{req.id}</h3>
          <p><b>Service Type:</b> {req.service || "Not specified"}</p>
          <p><b>Date:</b> {req.scheduled_date || "Not specified"}</p>
          <p><b>Time:</b> {req.scheduled_time || "Not specified"}</p>
          <p><b>Location:</b> {req.location_note || "Not specified"}</p>
          <p><b>Description:</b> {req.description || "Not specified"}</p>

          {/* Technician info and chat button */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              background: "#cfd8dc",
              padding: "10px",
              borderRadius: "10px",
              margin: "15px 0"
            }}
          >
            <span style={{ flex: 1 }}>
              👤 Technician: {technicianName || "Assigned technician"}
            </span>

            <button
              className="primary-btn"
              style={{ padding: "5px 15px" }}
              onClick={() => {
                if (technicianUserId) {
                  navigate(`/chat/${technicianUserId}`);
                  return;
                }
                setSubmitMessage("Chat will be available once a technician is assigned.");
              }}
            >
              Chat
            </button>
          </div>

          {/* Request status timeline */}
          <div className="timeline">
            {timelineSteps.map((step, index) => (
              <div
                key={step}
                className={`timeline-item ${activeIndex >= index ? "active" : ""}`}
              >
                {step}
              </div>
            ))}
          </div>

          {/* Rating section - only visible when request is completed */}
          {isCompleted ? (
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <p>Rate your experience:</p>

              {/* Rating dropdown */}
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

              {/* Comment input */}
              <textarea
                placeholder="Leave a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{
                  width: "100%",
                  marginTop: "10px",
                  borderRadius: "10px",
                  padding: "10px"
                }}
                disabled={Boolean(existingRating)}
              />

              {submitMessage ? <p>{submitMessage}</p> : null}

              {/* Submit rating button */}
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
          ) : (
            <p style={{ textAlign: "center", marginTop: "20px" }}>
              You can rate the service after it is marked as <b>Completed</b>.
            </p>
          )}
        </div>
      </div>
    </>
  );
}

// Export component
export default ReviewRequest;
