import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/common/Header";
import API from "../../services/api";
import TechnicianProfileGallery from "../technician/TechnicianGalleryManager";

function UserProfile() {
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [submenu, setSubmenu] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [dob, setDob] = useState("");

  const [photoPreview, setPhotoPreview] = useState("");
  const [profileMessage, setProfileMessage] = useState(null);

  const fileInputRef = useRef(null);

  const formatDate = (value) => {
    if (!value) return "";
    return String(value).split("T")[0];
  };

  const loadProfile = async () => {
    try {
      setProfileMessage(null);

      const res = await API.get(`/users/${currentUser.id}`);

      setProfile(res.data);
      setEmail(res.data.email || "");
      setPhone(res.data.phone || "");
      setCity(res.data.city || "");
      setDob(formatDate(res.data.dob));

      const savedPhoto = localStorage.getItem(`profile_photo_${currentUser.id}`);
      if (savedPhoto) setPhotoPreview(savedPhoto);
    } catch (err) {
      console.error("profile load error:", err);
      setProfileMessage({
        type: "error",
        title: "Error",
        body: "Failed to load profile.",
      });
    }
  };

  useEffect(() => {
    if (currentUser?.id) loadProfile();
  }, [currentUser?.id]);

  const openSoonMessage = (name) => {
    setMenuOpen(false);
    setSubmenu(null);

    setProfileMessage({
      type: "warning",
      title: name,
      body: "We will add this feature soon.",
    });
  };

  const handleSaveProfile = async () => {
    try {
      const payload = { email, phone, city, dob };

      await API.patch(`/users/${currentUser.id}`, payload);

      try {
        await API.post("/users/send-profile-update-email", {
          userId: currentUser.id,
          ...payload,
        });
      } catch (emailErr) {
        console.error("send profile email error:", emailErr);
      }

      const updatedProfile = { ...profile, ...payload };
      setProfile(updatedProfile);

      localStorage.setItem(
        "user",
        JSON.stringify({
          ...currentUser,
          email,
          phone,
          city,
          dob,
        })
      );

      setShowEditModal(false);

      setProfileMessage({
        type: "success",
        title: "Saved Successfully",
        body: "Profile updated successfully and we sent an email.",
      });
    } catch (err) {
      console.error("profile update error:", err);

      setProfileMessage({
        type: "error",
        title: "Error",
        body: err.response?.data?.message || "Failed to update profile.",
      });
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      localStorage.setItem(`profile_photo_${currentUser.id}`, reader.result);
      setPhotoPreview(reader.result);
      setShowPhotoModal(false);

      setProfileMessage({
        type: "success",
        title: "Saved Successfully",
        body: "Profile photo updated successfully.",
      });
    };

    reader.readAsDataURL(file);
  };

  if (!currentUser?.id) {
    return (
      <>
        <Header />
        <div className="profile-container">
          <div className="profile-card">
            <div className="message-box-card error">
              <div className="message-box-title">Error</div>
              <div className="message-box-body">User id is missing.</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="profile-container">
          <div className="profile-card">
            {profileMessage ? (
              <div className={`message-box-card ${profileMessage.type}`}>
                <div className="message-box-title">{profileMessage.title}</div>
                <div className="message-box-body">{profileMessage.body}</div>
              </div>
            ) : (
              <p>Loading...</p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header-settings">
            <div className="profile-identity">
              <div className="avatar profile-avatar-large">
                {photoPreview ? (
                  <img src={photoPreview} alt="profile" className="avatar-image" />
                ) : (
                  profile.name?.charAt(0)?.toUpperCase()
                )}
              </div>

              <div className="profile-title-block">
                <h2>{profile.name}</h2>
                <span className="role-badge">{profile.role}</span>
              </div>
            </div>

            <div className="profile-settings-wrapper">
              <button
                type="button"
                className="profile-settings-btn"
                onClick={() => {
                  setMenuOpen((prev) => !prev);
                  setSubmenu(null);
                }}
              >
                ⚙
              </button>

              {menuOpen && (
                <div className="profile-settings-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(true);
                      setMenuOpen(false);
                      setSubmenu(null);
                    }}
                  >
                    Edit Contact
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPhotoModal(true);
                      setMenuOpen(false);
                      setSubmenu(null);
                    }}
                  >
                    Edit Photo
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSubmenu(submenu === "language" ? null : "language")
                    }
                  >
                    Language ▸
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSubmenu(submenu === "theme" ? null : "theme")
                    }
                  >
                    Theme ▸
                  </button>

                  {submenu === "language" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "96px",
                        right: "230px",
                        minWidth: "180px",
                        background: "#fffaf4",
                        border: "1px solid #eadfce",
                        borderRadius: "18px",
                        boxShadow: "0 18px 34px rgba(0,0,0,0.14)",
                        padding: "10px",
                        zIndex: 40,
                      }}
                    >
                      <button type="button" onClick={() => openSoonMessage("Arabic")}>
                        Arabic
                      </button>

                      <button type="button" onClick={() => openSoonMessage("English")}>
                        English
                      </button>
                    </div>
                  )}

                  {submenu === "theme" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "144px",
                        right: "230px",
                        minWidth: "180px",
                        background: "#fffaf4",
                        border: "1px solid #eadfce",
                        borderRadius: "18px",
                        boxShadow: "0 18px 34px rgba(0,0,0,0.14)",
                        padding: "10px",
                        zIndex: 40,
                      }}
                    >
                      <button type="button" onClick={() => openSoonMessage("Light Theme")}>
                        Light
                      </button>

                      <button type="button" onClick={() => openSoonMessage("Dark Theme")}>
                        Dark
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {profileMessage && (
            <div className={`message-box-card ${profileMessage.type}`}>
              <div className="message-box-title">{profileMessage.title}</div>
              <div className="message-box-body">{profileMessage.body}</div>
            </div>
          )}

          <div className="profile-info">
            <p><b>Email:</b> {profile.email || "-"}</p>
            <p><b>Phone:</b> {profile.phone || "-"}</p>
            <p><b>City:</b> {profile.city || "-"}</p>
            <p><b>Birth Date:</b> {formatDate(profile.dob) || "-"}</p>
          </div>

          {profile.role === "technician" && profile.technician_id && (
            <TechnicianProfileGallery technicianId={profile.technician_id} />
          )}
        </div>
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update Contact</h3>

            <div className="input-group">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="input-group">
              <label>City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Birth Date</label>
              <input type="date" value={dob} onChange={(e) => setDob(e.target.value)} />
            </div>

            <div className="modal-actions">
              <button className="secondary" type="button" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>

              <button className="primary" type="button" onClick={handleSaveProfile}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showPhotoModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update Photo</h3>

            <div className="profile-photo-preview-wrap">
              <div className="avatar profile-avatar-large">
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="avatar-image" />
                ) : (
                  profile.name?.charAt(0)?.toUpperCase()
                )}
              </div>
            </div>

            <div className="input-group">
              <label>Select Image</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="modal-actions">
              <button className="secondary" type="button" onClick={() => setShowPhotoModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserProfile;