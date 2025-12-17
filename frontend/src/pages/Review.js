import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getRequestById } from "../services/maintenanceService";
import { submitRating } from "../services/ratingService";

function RatingReviewRequest() {
  const { id } = useParams();
  const [request, setRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    const fetchRequest = async () => {
      try {
        const data = await getRequestById(id);
        setRequest(data);
      } catch (error) {
        alert(error.message);
      }
    };
    fetchRequest();
  }, [id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) {
      alert("Please select a rating before submitting!");
      return;
    }
    try {
      await submitRating(id, { rating, comment });
      alert("Thank you! Your review has been submitted.");
      setComment("");
      setRating(0);
    } catch (error) {
      alert(error.message);
    }
  };

  if (!request) return <p>Loading request details...</p>;

  return (
    <div className="container">
      <h2>Request Details</h2>
      <div className="card">
        <p><strong>Service:</strong> {request.service}</p>
        <p><strong>Technician:</strong> {request.technician?.name || "Not assigned"}</p>
        <p><strong>Date:</strong> {request.date} <strong>Time:</strong> {request.time}</p>
        <p><strong>Address:</strong> {request.address}</p>
        <p><strong>Description:</strong> {request.description}</p>
        <p><strong>Status:</strong> {request.status}</p>
      </div>

      {/* Tracking Box */}
      <div className="card" style={{ marginTop: "20px" }}>
        <h3>Tracking</h3>
        <p>Status: {request.status}</p>
      </div>

      {/* Rating Box */}
      {request.status === "completed" && (
        <div className="card" style={{ marginTop: "20px" }}>
          <h3>Rate this Service</h3>
          <p>Leave your feedback and rating for the technician:</p>
          <form onSubmit={handleSubmit}>
            <div style={{ display: "flex", gap: "5px", fontSize: "30px" }}>
              {[1,2,3,4,5].map(star => (
                <span key={star}
                      style={{ cursor: "pointer", color: (hoverRating || rating) >= star ? "#FFD700" : "#ccc" }}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}>
                  ★
                </span>
              ))}
            </div>

            <div className="input-group" style={{ marginTop: "10px" }}>
              <label>Comment:</label>
              <textarea value={comment} onChange={e => setComment(e.target.value)} required />
            </div>

            <button className="primary" type="submit">Submit Review</button>
          </form>
        </div>
      )}
    </div>
  );
}

export default RatingReviewRequest;
