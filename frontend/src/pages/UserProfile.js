import React, { useEffect, useState } from "react";
import { getUserProfile } from "../services/userService";

function UserProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    getUserProfile(user.id).then(setProfile);
  }, [user.id]);

  if (!profile) return null;

  return (
    <div className="container">
      <h2>{profile.name}</h2>
      <p>{profile.email}</p>
      <p>{profile.phone}</p>
      <p>{profile.city}</p>
    </div>
  );
}

export default UserProfile;
