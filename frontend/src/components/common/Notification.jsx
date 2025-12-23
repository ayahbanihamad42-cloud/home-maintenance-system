import React, { useEffect, useState } from "react";
import { getNotifications } from "../services/notificationService";

const Notification = ({ user_id }) => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    getNotifications(user_id).then(res => setNotifications(res.data));
  }, [user_id]);

  return (
    <div className="notification-list">
      {notifications.map(n => (
        <div key={n.id} className="notification-card">
          <p>{n.message}</p>
          <small>{new Date(n.created_at).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
};

export default Notification;
