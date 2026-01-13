import React, { useEffect, useState } from "react";
import API from "../../services/api";
import Header from "../../components/common/Header";

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const [showEditModal, setShowEditModal] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => {
    API.get(`/users/${user.id}`).then(res => {
      setProfile(res.data);
      setEmail(res.data.email || "");
      setPhone(res.data.phone || "");
    });
  }, [user.id]);

  if (!profile) return <div className="loader">Loading...</div>;

  const resetEditForm = () => {
    setEmail(profile?.email || "");
    setPhone(profile?.phone || "");
    setEditMessage("");
  };

  const submitProfileUpdate = async () => {
    if (!email) {
      setEditMessage("Email is required.");
      return;
    }
    try {
      await API.patch(`/users/${user.id}`, { email, phone });
      setEditMessage("Profile updated successfully.");
      setProfile((prev) => ({ ...prev, email, phone }));
      setTimeout(() => {
        setShowEditModal(false);
        resetEditForm();
      }, 1200);
    } catch (error) {
      setEditMessage(error.response?.data?.message || "Failed to update profile.");
    }
  };

  return (
    <>
      <Header />
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="avatar">{profile.name.charAt(0)}</div>
            <h2>{profile.name}</h2>
            <span className="role-badge">{profile.role}</span>
          </div>
          <div className="profile-info">
            <p><b>Email:</b> {profile.email}</p>
            <p><b>Phone:</b> {profile.phone || "Not set"}</p>
            <p><b>City:</b> {profile.city}</p>
            <p><b>Birth Date:</b> {new Date(profile.dob).toLocaleDateString()}</p>
          </div>
          <button
            className="edit-btn"
            onClick={() => {
              resetEditForm();
              setShowEditModal(true);
            }}
          >
            Edit Profile
          </button>
        </div>
      </div>

      {showEditModal ? (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal" onClick={(event) => event.stopPropagation()}>
            <h3>Update Profile</h3>
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
            {editMessage ? <p className="helper-text">{editMessage}</p> : null}
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
    </>
  );
}
export default UserProfile;
