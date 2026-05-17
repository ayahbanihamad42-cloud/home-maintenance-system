import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import API from "../../services/api";
import { getTechnicianGallery } from "../../services/technicianService";

function TechnicianProfile() {
  const { technicianId } = useParams();
  const navigate = useNavigate();

  const [tech, setTech] = useState(null);
  const [galleryPosts, setGalleryPosts] = useState([]);

  useEffect(() => {
    API.get(`/technicians/${technicianId}`)
      .then((res) => setTech(res.data))
      .catch((err) => console.error("TechnicianProfile error:", err));
  }, [technicianId]);

  useEffect(() => {
    getTechnicianGallery(technicianId)
      .then((posts) => setGalleryPosts(posts || []))
      .catch(() => setGalleryPosts([]));
  }, [technicianId]);

  const openPost = (post) => {
    sessionStorage.setItem("selectedGalleryPost", JSON.stringify(post));
    navigate(`/technician/gallery/post/${post.id}`, { state: { post } });
  };

  if (!tech) return <div className="loader">Loading...</div>;

  return (
    <>
      <Header />

      <div className="profile-container">
        <div className="tech-card">
          <h2>{tech.name}</h2>

          <p className="specialty">{tech.service} Specialist</p>

          <div className="tech-stats">
            <span>
              <b>Experience:</b> {tech.experience} Years
            </span>

            <span>
              <b>Rating:</b> ⭐ {Number(tech.rating || 0).toFixed(1)}
            </span>

            <span>
              <b>Price / hour:</b>{" "}
              {Number(tech.price_per_hour || 0).toFixed(2)} JOD
            </span>
          </div>

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

          <p className="bio">
            {tech.bio || "Experienced technician ready to help."}
          </p>

          <div className="actions">
            <button
              className="primary-btn"
              onClick={() => navigate(`/chat/${tech.user_id}`)}
            >
              Send Message
            </button>

            <button
              className="primary-btn"
              onClick={() => navigate(`/request/${tech.technicianId}`)}
            >
              Book Now
            </button>
          </div>

          <div className="gallery-soft-divider"></div>

          <div className="public-gallery-wrapper">
            <h3 className="profile-gallery-title">Work Gallery</h3>

            {galleryPosts.length === 0 ? (
              <div className="gallery-empty-text">No work posts yet.</div>
            ) : (
              <div className="pinterest-gallery">
                {galleryPosts.map((post) => (
                  <button
                    type="button"
                    className="pinterest-post"
                    key={post.id}
                    onClick={() => openPost(post)}
                  >
                    <img
                      src={post.images?.[0]}
                      alt="Technician completed work"
                    />

                    <div className="pinterest-caption">
                      {post.description}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default TechnicianProfile;