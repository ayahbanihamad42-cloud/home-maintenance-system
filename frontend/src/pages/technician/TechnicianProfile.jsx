import React, { useEffect, useMemo, useState } from "react";
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
      .then((posts) => setGalleryPosts(Array.isArray(posts) ? posts : []))
      .catch(() => setGalleryPosts([]));
  }, [technicianId]);

  const normalizeImages = (post) => {
    if (!post) return [];

    if (Array.isArray(post.images)) {
      return post.images.filter(Boolean);
    }

    if (typeof post.images === "string") {
      try {
        const parsed = JSON.parse(post.images);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        return post.images
          .split(",")
          .map((img) => img.trim())
          .filter(Boolean);
      }
    }

    if (post.image_url) return [post.image_url];
    if (post.image) return [post.image];

    return [];
  };

  const fixedGalleryPosts = useMemo(() => {
    return galleryPosts.map((post) => ({
      ...post,
      images: normalizeImages(post),
    }));
  }, [galleryPosts]);

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
              onClick={() =>
                navigate(`/request/${tech.technicianId || tech.id}`, {
                  state: {
                    technicianId: tech.technicianId || tech.id,
                    technician_id: tech.technicianId || tech.id,
                    technicianName: tech.name,
                    name: tech.name,
                    service: tech.service,
                    service_type: tech.service,
                    price_per_hour: tech.price_per_hour,
                  },
                })
              }
            >
              Book Now
            </button>
          </div><hr></hr>
          <div className="gallery-soft-divider"></div>

          <div className="public-gallery-wrapper">
            <h3 className="profile-gallery-title">Work Gallery</h3>

            {fixedGalleryPosts.length === 0 ? (
              <div className="gallery-empty-text">No work posts yet.</div>
            ) : (
              <div className="pinterest-gallery">
                {fixedGalleryPosts.map((post) => {
                  const firstImage = post.images?.[0];

                  return (
                    <button
                      type="button"
                      className="pinterest-post"
                      key={post.id}
                      onClick={() => openPost(post)}
                    >
                      {firstImage ? (
                        <img src={firstImage} alt="Technician completed work" />
                      ) : (
                        <div className="gallery-empty-text">No image</div>
                      )}

                      <div className="pinterest-caption">
                        {(post.description || post.caption || "No description")
                          .length > 55
                          ? `${(
                              post.description ||
                              post.caption ||
                              "No description"
                            ).slice(0, 55)}...`
                          : post.description || post.caption || "No description"}
                      </div>

                      {(post.location_note || post.location) && (
                        <div className="pinterest-location">
                          Location: {post.location_note || post.location}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default TechnicianProfile;