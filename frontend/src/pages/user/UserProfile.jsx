import React, { useEffect, useRef, useState } from "react";
import API from "../../services/api";
import Header from "../../components/common/Header";
import TechnicianProfileGallery from "../../pages/technician/TechnicianGalleryManager.jsx";

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const [profileMessage, setProfileMessage] = useState(null);
  const [photoPreview, setPhotoPreview] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    API.get(`/users/${user.id}`).then(res => {
      setProfile(res.data);
      setEmail(res.data.email || "");
      setPhone(res.data.phone || "");

      const savedPhoto = localStorage.getItem(`profile_photo_${user.id}`);
      if (savedPhoto) {
        setPhotoPreview(savedPhoto);
      }
    });
  }, [user.id]);

  if (!profile) return <div className="loader">Loading...</div>;

  const resetEditForm = () => {
    setEmail(profile?.email || "");
    setPhone(profile?.phone || "");
  };

  const submitProfileUpdate = async () => {
    if (!email) {
      setProfileMessage({
        type: "warning",
        title: "Notice",
        body: "Email is required."
      });
      return;
    }

    try {
      await API.patch(`/users/${user.id}`, { email, phone });

      try {
        await API.post(`/users/${user.id}/send-verification`, { email });
      } catch (err) {
        console.error("Verification email service error");
      }

      setProfile((prev) => ({ ...prev, email, phone }));

      setProfileMessage({
        type: "success",
        title: "Saved Successfully",
        body: "Profile updated. Please review your email."
      });

      setTimeout(() => {
        setShowEditModal(false);
      }, 1800);
    } catch (error) {
      setProfileMessage({
        type: "error",
        title: "Notice",
        body: error.response?.data?.message || "Failed to update profile."
      });
    }
  };

  const handlePhotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const imageData = reader.result;
      setPhotoPreview(imageData);
      localStorage.setItem(`profile_photo_${user.id}`, imageData);

      setProfileMessage({
        type: "success",
        title: "Saved Successfully",
        body: "Profile photo updated."
      });

      setShowPhotoModal(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Header />

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header-settings">
            <div className="profile-identity">
              <div className="avatar profile-avatar-large">
                {photoPreview ? (
                  <img src={photoPreview} alt="Profile" className="avatar-image" />
                ) : (
                  profile.name.charAt(0)
                )}
              </div>

              <div className="profile-title-block">
                <h2>{profile.name}</h2>
                <span className="role-badge">{profile.role}</span>
              </div>
            </div>

            <div className="profile-settings-wrapper">
              <button
                className="profile-settings-btn"
                onClick={() => setMenuOpen((prev) => !prev)}
              >
                ⚙
              </button>

              {menuOpen ? (
                <div className="profile-settings-menu">
                  <button
                    onClick={() => {
                      resetEditForm();
                      setProfileMessage(null);
                      setShowEditModal(true);
                      setMenuOpen(false);
                    }}
                  >
                    Edit Contact
                  </button>

                  <button
                    onClick={() => {
                      setShowPhotoModal(true);
                      setMenuOpen(false);
                    }}
                  >
                    Edit Photo
                  </button>

                  <button
                    onClick={() => {
                      setProfileMessage({
                        type: "warning",
                        title: "Notice",
                        body: "Language setting will be added here."
                      });
                      setMenuOpen(false);
                    }}
                  >
                    Language
                  </button>

                  <button
                    onClick={() => {
                      setProfileMessage({
                        type: "warning",
                        title: "Notice",
                        body: "Theme setting will be added here."
                      });
                      setMenuOpen(false);
                    }}
                  >
                    Theme
                  </button>
                </div>
              ) : null}
            </div>
          </div>

          {profileMessage ? (
            <div className={`message-box-card profile-message-box ${profileMessage.type}`}>
              <div className="message-box-title">{profileMessage.title}</div>
              <div className="message-box-body">{profileMessage.body}</div>
            </div>
          ) : null}

          <div className="profile-info">
            <p><b>Email:</b> {profile.email}</p>
            <p><b>Phone:</b> {profile.phone || "Not set"}</p>
            <p><b>City:</b> {profile.city}</p>
            <p><b>Birth Date:</b> {new Date(profile.dob).toLocaleDateString()}</p>
          </div>
          {JSON.parse(localStorage.getItem("user") || "{}")?.role === "technician" ? (
  <TechnicianProfileGallery />
) : null}
        </div>
      </div>

      {showEditModal ? (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h3>Update Contact</h3>

            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </div>

            <div className="input-group">
              <label>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone number"
              />
            </div>

            {profileMessage ? (
              <div className={`message-box-card inside-modal ${profileMessage.type}`}>
                <div className="message-box-title">{profileMessage.title}</div>
                <div className="message-box-body">{profileMessage.body}</div>
              </div>
            ) : null}

            <div className="modal-actions">
              <button className="secondary" onClick={() => setShowEditModal(false)}>
                Cancel
              </button>
              <button className="primary" onClick={submitProfileUpdate}>
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showPhotoModal ? (
        <div className="modal-overlay" onClick={() => setShowPhotoModal(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h3>Update Profile Photo</h3>

            {photoPreview ? (
              <div className="profile-photo-preview-wrap">
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="profile-photo-preview"
                />
              </div>
            ) : null}

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
              <button className="secondary" onClick={() => setShowPhotoModal(false)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default UserProfile;