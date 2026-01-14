

  // React library and hooks
import React, { useEffect, useState } from "react";

// Notification service
import { getNotifications } from "../../services/notificationService.jsx";

// Notification icon
import notification from "../../images/notifications.png";

// Notification bell component
const Notification = ({ user_id }) => {

// Unread notifications count
  const [count, setCount] = useState(0);

  useEffect(() => {
// Fetch notifications on component mount
    getNotifications().then(n =>
// Count unread notifications
      setCount(n.filter(x => !x.is_read).length)
    );
  }, []);

  return (
    <div className="notification-bell">
  {/* Notification icon */}
      <img src={notification} alt="notifications" width="24" height="24"/>

 {/* Show badge only if there are unread notifications */}
      {count > 0 && <span className="badge">{count}</span>}
    </div>
  );
}
    // Export component
export default Notification;