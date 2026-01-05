import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";

function TechnicianProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tech, setTech] = useState(null);

  useEffect(() => {
    API.get(`/technicians/${id}`).then(res => setTech(res.data));
  }, [id]);

  if (!tech) return <div className="loader">Loading...</div>;

  return (
    <div className="profile-container">
      <div className="tech-card">
        <h2>{tech.name}</h2>
        <p className="specialty">{tech.service} Specialist</p>
        <div className="tech-stats">
          <span><b>Experience:</b> {tech.experience_years} Years</span>
          <span><b>Rating:</b> ⭐ {tech.rating || "N/A"}</span>
        </div>
        <p className="bio">{tech.bio}</p>
        <div className="actions">
          <button className="primary-btn" onClick={() => navigate(`/chat/${tech.user_id}`)}>Send Message</button>
        </div>
      </div>
    </div>
  );
}
export default TechnicianProfile;