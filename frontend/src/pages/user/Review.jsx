import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { submitRating } from "../../services/ratingService";
import API from "../../services/api";

function Review() {
  const { request_id } = useParams();

  const [request, setRequest] = useState(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  useEffect(() => {
    API.get(`/maintenance/${request_id}`)
      .then(res => setRequest(res.data));
  }, [request_id]);

  const submit = async () => {
    if (!rating) {
      alert("Please select rating");
      return;
    }

    await submitRating({
      request_id,
      technician_id: request.technician_id,
      rating,
      comment
    });

    alert("Review submitted");
  };

  if (!request) return null;

  return (
    <div className="container">
      <h2>Review Service</h2>

      {/* 📦 REQUEST SUMMARY */}
      <div className="card summary-box">
        <h3>Request Summary</h3>
        <p><b>Service:</b> {request.service}</p>
        <p><b>City:</b> {request.city}</p>
        <p><b>Technician:</b> {request.technician_name}</p>
        <p><b>Description:</b> {request.description}</p>
      </div>

      {/* ⭐ RATING BOX */}
      <div className="card rating-box">
        <h3>Your Rating</h3>

        <div className="stars">
          {[1,2,3,4,5].map(star => (
            <span
              key={star}
              className={star <= rating ? "star active" : "star"}
              onClick={() => setRating(star)}
            >
              ★
            </span>
          ))}
        </div>

        <textarea
          placeholder="Write your feedback"
          onChange={e => setComment(e.target.value)}
        />

        <button className="primary" onClick={submit}>
          Submit Review
        </button>
      </div>
    </div>
  );
}

export default Review;
