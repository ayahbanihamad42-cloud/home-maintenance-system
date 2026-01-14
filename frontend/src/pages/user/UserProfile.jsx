// Import React hooks
import React, { useEffect, useState } from "react";

// Import API service
import API from "../../services/api";

// Import shared Header component
import Header from "../../components/common/Header";

// User profile component
function UserProfile() {

  // State to store user profile data
  const [profile, setProfile] = useState(null);

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // State to control edit modal visibility
  const [showEditModal, setShowEditModal] = useState(false);

  // Editable fields
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  // Message for edit feedback
  const [editMessage, setEditMessage] = useState("");

  // Fetch user profile data on component mount
  useEffect(() => {
    API.get(`/users/${user.id}`).then(res => {
      setProfile(res.data);
      setEmail(res.data.email || "");
      setPhone(res.data.phone || "");
    });
  }, [user.id]);

  // Show loader while profile is loading
  if (!profile) return <div className="loader">Loading...</div>;

  // Reset edit form values to current profile data
  const resetEditForm = () => {
    setEmail(profile?.email || "");
    setPhone(profile?.phone || "");
    setEditMessage("");
  };

  // Submit updated profile information
  const submitProfileUpdate = async () => {
    if (!email) {
      setEditMessage("Email is required.");
      return;
    }
    try {
      await API.patch(`/users/${user.id}`, { email, phone });
      setEditMessage("Profile updated successfully.");

      // Update profile state locally
      setProfile((prev) => ({ ...prev, email, phone }));

      // Close modal after a short delay
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
      {/* Page header */}
      <Header />

      {/* Profile display section */}
      <div className="profile-container">
        <div className="profile-card">

          {/* Profile header with avatar and role */}
          <div className="profile-header">
            <div className="avatar">{profile.name.charAt(0)}</div>
            <h2>{profile.name}</h2>
            <span className="role-badge">{profile.role}</span>
          </div>

          {/* Profile information */}
          <div className="profile-info">
            <p><b>Email:</b> {profile.email}</p>
            <p><b>Phone:</b> {profile.phone || "Not set"}</p>
            <p><b>City:</b> {profile.city}</p>
            <p><b>Birth Date:</b> {new Date(profile.dob).toLocaleDateString()}</p>
          </div>

          {/* Button to open edit modal */}
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

      {/* Edit profile modal */}
      {showEditModal ? (
        <div
          className="modal-overlay"
          onClick={() => setShowEditModal(false)}
        >
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <h3>Update Profile</h3>

            {/* Email input */}
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="name@example.com"
              />
            </div>

            {/* Phone input */}
            <div className="input-group">
              <label>Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="Phone number"
              />
            </div>

            {/* Feedback message */}
            {editMessage ? <p className="helper-text">{editMessage}</p> : null}

            {/* Modal action buttons */}
            <div className="modal-actions">
              <button
                className="secondary"
                onClick={() => setShowEditModal(false)}
              >
                Cancel
              </button>
              <button
                className="primary"
                onClick={submitProfileUpdate}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

// Export component
export default UserProfile;
