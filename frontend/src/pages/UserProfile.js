import React, { useEffect, useState } from "react";
import { getUserProfile } from "../services/userService";
import Notification from "../components/Notification";
import { getUserRequests } from "../services/maintenanceService";

function UserProfile() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile(user.id);
        setProfile(data);
      } catch (error) {
        alert(error.message);
      }
    };
    const fetchNotifications = async () => {
      try {
        const requests = await getUserRequests(user.id);
        const messages = requests
          .filter(r => r.status !== "completed")
          .map(r => ({ message: `Request ${r.service} is ${r.status}`, created_at: r.created_at }));
        setNotifications(messages);
      } catch (error) {
        console.log(error);
      }
    };
    fetchProfile();
    fetchNotifications();
  }, [user.id]);

  if (!profile) return <p>Loading...</p>;

  return (
    <div className="container">
      <h2>{profile.name}'s Profile</h2>
      <p>Email: {profile.email}</p>
      <p>Phone: {profile.phone}</p>
      <p>City: {profile.city}</p>
      <p>DOB: {profile.dob}</p>
      <h3>Notifications</h3>
      {notifications.map((n,i) => <Notification key={i} notification={n} />)}
    </div>
  );
}

export default UserProfile;
