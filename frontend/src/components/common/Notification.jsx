import React, { useEffect, useState } from "react";
import { getNotifications } from "../services/notificationService";

const Notification = ({ user_id }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    getNotifications().then(n =>
      setCount(n.filter(x => !x.is_read).length)
    );
  }, []);

  return (
    <div className="notification-bell">
      <img src="/images/nitification.png" alt="notifications" />
      {count > 0 && <span className="badge">{count}</span>}
    </div>
  );
}

export default Notification;
