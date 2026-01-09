import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../../services/api";
import Header from "../../components/common/Header";

function TechnicianProfile() {
  const { technicianId } = useParams();
  const navigate = useNavigate();
  const [tech, setTech] = useState(null);

  useEffect(() => {
    API.get(`/technicians/${technicianId}`).then(res => setTech(res.data));
  }, [technicianId]);

  if (!tech) return <div className="loader">Loading...</div>;

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="tech-card">
          <h2>{tech.name}</h2>
          <p className="specialty">{tech.service} Specialist</p>
          <div className="tech-stats">
            <span><b>Experience:</b> {tech.experience} Years</span>
            <span><b>Rating:</b> ⭐ {Number(tech.rating).toFixed(1)}</span>
          </div>
          <div className="contact-list">
            <span><b>City:</b> {tech.city || "Not provided"}</span>
            <span><b>Phone:</b> {tech.phone || "Not provided"}</span>
            <span><b>Email:</b> {tech.email || "Not provided"}</span>
          </div>
          <p className="bio">{tech.bio || "Experienced technician ready to help."}</p>
          <div className="actions">
            <button className="primary-btn" onClick={() => navigate(`/chat/${tech.user_id}`)}>Send Message</button>
          </div>
        </div>
      </div>
    </>
  );
}
export default TechnicianProfile;
