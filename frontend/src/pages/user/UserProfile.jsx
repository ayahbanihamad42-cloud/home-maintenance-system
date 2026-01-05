import React, { useEffect, useState } from "react";
import API from "../../services/api";
import Header from "../../components/common/Header";
function UserProfile() {
  const [profile, setProfile] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    API.get(`/users/${user.id}`).then(res => setProfile(res.data));
  }, [user.id]);

  if (!profile) return <div className="loader">Loading...</div>;

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
          <button className="edit-btn">Edit Profile</button>
        </div>
      </div>
    </>
  );
}
export default UserProfile;