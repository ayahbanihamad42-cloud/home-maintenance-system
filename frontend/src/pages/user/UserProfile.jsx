import React, { useEffect, useState } from "react";
import API from "../../services/api";

function UserProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    API.get(`/users/${user.id}`).then(res => setProfile(res.data));
  }, [user.id]);

  if (!profile) return null;

  return (
    <div className="container">
      <h2>{profile.name}</h2>
      <p>{profile.email}</p>
      <p>{profile.phone}</p>
      <p>{profile.city}</p>
      <p>{profile.dob}</p>
    </div>
  );
}

export default UserProfile;
