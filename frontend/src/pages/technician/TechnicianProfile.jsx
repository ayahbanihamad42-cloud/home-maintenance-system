import React, { useEffect, useState } from "react";
// React and hooks

import { useParams, useNavigate } from "react-router-dom";
// Route parameters and navigation hooks

import API from "../../services/api";
// Axios API instance

import Header from "../../components/common/Header";
// Header component

// Technician profile page
function TechnicianProfile() {

  // Get technician ID from URL
  const { technicianId } = useParams();

  // Navigation hook
  const navigate = useNavigate();

  // Technician data state
  const [tech, setTech] = useState(null);

  // Fetch technician details on component mount
  useEffect(() => {

    // Request technician data from backend
    API.get(`/technicians/${technicianId}`)
      .then(res => setTech(res.data));

  }, [technicianId]);

  // Show loading indicator while data is loading
  if (!tech) return <div className="loader">Loading...</div>;

  return (
    <>
      {/* Page header */}
      <Header />

      <div className="profile-container">

        {/* Technician profile card */}
        <div className="tech-card">

          {/* Technician name */}
          <h2>{tech.name}</h2>

          {/* Technician specialty */}
          <p className="specialty">
            {tech.service} Specialist
          </p>

          {/* Technician stats */}
          <div className="tech-stats">
            <span>
              <b>Experience:</b> {tech.experience} Years
            </span>
            <span>
              <b>Rating:</b> ⭐ {Number(tech.rating).toFixed(1)}
            </span>
          </div>

          {/* Contact information */}
          <div className="contact-list">
            <span>
              <b>City:</b> {tech.city || "Not provided"}
            </span>
            <span>
              <b>Phone:</b> {tech.phone || "Not provided"}
            </span>
            <span>
              <b>Email:</b> {tech.email || "Not provided"}
            </span>
          </div>

          {/* Technician bio */}
          <p className="bio">
            {tech.bio || "Experienced technician ready to help."}
          </p>

          {/* Action buttons */}
          <div className="actions">

            {/* Navigate to chat with technician */}
            <button
              className="primary-btn"
              onClick={() => navigate(`/chat/${tech.user_id}`)}
            >
              Send Message
            </button>

          </div>
        </div>
      </div>
    </>
  );
}

// Export component
export default TechnicianProfile;

