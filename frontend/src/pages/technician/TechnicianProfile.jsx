import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../../components/common/Header";
import API from "../../services/api.jsx";
import { getTechnicianGallery } from "../../services/technicianService.jsx";
import {
  getChatMessages,
  sendChatMessage,
} from "../../services/chatService.jsx";

function TechnicianProfile() {
  const { technicianId } = useParams();
  const navigate = useNavigate();

  const loggedUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [tech, setTech] = useState(null);
  const [galleryPosts, setGalleryPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [chatError, setChatError] = useState("");
  const chatFileRef = useRef(null);

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

  const receiverId = tech?.user_id || tech?.userId;

  const loadChatMessages = async () => {
    try {
      if (!receiverId) return;

      const data = await getChatMessages(receiverId);
      setChatMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("load profile chat error:", err);
      setChatMessages([]);
    }
  };

  const openChat = async () => {
    if (!receiverId) {
      setChatError("Technician chat account was not found.");
      return;
    }

    setChatError("");
    setChatOpen(true);
    await loadChatMessages();
  };

  useEffect(() => {
    if (!chatOpen || !receiverId) return;

    loadChatMessages();

    const timer = setInterval(() => {
      loadChatMessages();
    }, 3000);

    return () => clearInterval(timer);
  }, [chatOpen, receiverId]);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();

      reader.onload = () => {
        img.src = reader.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 700;
        const scale = Math.min(maxWidth / img.width, 1);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.55));
      };

      reader.onerror = reject;
      img.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendChat = async (content = null, type = "text") => {
    try {
      if (!receiverId) return;

      const value = String(content ?? chatText ?? "");

      if (type === "text" && !value.trim()) return;
      if (type !== "text" && !value) return;

      await sendChatMessage({
        receiver_id: Number(receiverId),
        message: value,
        type,
      });

      if (type === "text") {
        setChatText("");
      }

      await loadChatMessages();
    } catch (err) {
      console.error("send profile chat error:", err);
      setChatError(err.response?.data?.message || "Failed to send message.");
    }
  };

  const handleChatImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const image = await compressImage(file);
      await sendChat(image, "image");

      e.target.value = "";
    } catch {
      setChatError("Failed to send image.");
    }
  };

  const handleChatLocation = () => {
    if (!navigator.geolocation) {
      setChatError("Geolocation is not supported by this browser.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;

        await sendChat(url, "location");
      },
      () => {
        setChatError("Please allow location access and try again.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
      }
    );
  };

  const renderChatMessage = (msg) => {
    if (msg.type === "image") {
      return (
        <img
          className="chat-message-image"
          src={msg.message}
          alt="sent"
        />
      );
    }

    if (msg.type === "location") {
      return (
        <a href={msg.message} target="_blank" rel="noreferrer">
          Open Location
        </a>
      );
    }

    return msg.message;
  };

  const openPost = (post) => {
    setSelectedPost(post);
  };

  const closePost = () => {
    setSelectedPost(null);
  };

  if (!tech) {
    return (
      <>
        <Header />
        <div className="loader" style={{ paddingTop: "150px" }}>
          Loading...
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="profile-container" style={{ paddingTop: "135px" }}>
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

          {chatError && <div className="auth-error">{chatError}</div>}

          <div className="actions">
            <button className="primary-btn" onClick={openChat}>
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
          </div>

          <hr />

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
                        <img
                          src={firstImage}
                          alt="Technician completed work"
                        />
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
                          : post.description ||
                            post.caption ||
                            "No description"}
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

      {chatOpen && (
        <div className="khidma-popup khidma-chat-popup">
          <div className="khidma-popup-header">
            <h3>{tech.name}</h3>

            <button
              className="link-button"
              type="button"
              onClick={() => setChatOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="khidma-popup-body">
            <div className="popup-messages">
              {chatMessages.length === 0 ? (
                <div className="notification-empty">No messages yet.</div>
              ) : (
                chatMessages.map((msg, index) => {
                  const mine =
                    Number(msg.sender_id) === Number(loggedUser.id);

                  return (
                    <div
                      key={msg.id || index}
                      className={`popup-message ${mine ? "mine" : ""}`}
                    >
                      {renderChatMessage(msg)}
                    </div>
                  );
                })
              )}
            </div>

            <input
              ref={chatFileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleChatImage}
            />

            <div className="chat-tools">
              <button
                className="chat-tool-btn"
                type="button"
                onClick={() => chatFileRef.current?.click()}
              >
                📷 Image
              </button>

              <button
                className="chat-tool-btn"
                type="button"
                onClick={handleChatLocation}
              >
                📍 Location
              </button>
            </div>

            <div className="khidma-popup-input">
              <input
                value={chatText}
                onChange={(e) => setChatText(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendChat();
                }}
              />

              <button className="primary" onClick={() => sendChat()}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedPost && (
        <div
          className="gallery-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
          onClick={closePost}
        >
          <div
            className="gallery-modal-card"
            style={{
              width: "min(900px, 95vw)",
              maxHeight: "88vh",
              overflowY: "auto",
              background: "#fff",
              borderRadius: "28px",
              padding: "24px",
              boxShadow: "0 24px 70px rgba(70, 24, 120, 0.3)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="request-card-header">
              <h2>Work Post Details</h2>

              <button
                className="link-button"
                type="button"
                onClick={closePost}
                style={{ fontSize: "22px" }}
              >
                ✕
              </button>
            </div>

            <div className="pinterest-gallery">
              {(selectedPost.images || []).map((img, index) => (
                <img
                  key={`${img}-${index}`}
                  src={img}
                  alt="Technician work"
                  style={{
                    width: "100%",
                    borderRadius: "18px",
                    marginBottom: "16px",
                  }}
                />
              ))}
            </div>

            <div className="card">
              <p>
                <strong>Description:</strong>{" "}
                {selectedPost.description ||
                  selectedPost.caption ||
                  "No description"}
              </p>

              <p>
                <strong>Location:</strong>{" "}
                {selectedPost.location_note ||
                  selectedPost.location ||
                  "Not provided"}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TechnicianProfile;