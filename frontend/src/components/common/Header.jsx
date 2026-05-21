import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getNotificationFeed,
  markNotificationAsRead,
} from "../../services/notificationService.jsx";

function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = String(user.role || "").toLowerCase();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const loadNotifications = async () => {
    try {
      const data = await getNotificationFeed();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("notifications error:", err);
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  const goHome = () => {
    if (role === "technician") navigate("/technician-dashboard");
    else if (role === "admin") navigate("/admin");
    else navigate("/home");
  };

  const handleNotificationClick = async (n) => {
    if (String(n.id).startsWith("stored-")) {
      const realId = String(n.id).replace("stored-", "");
      await markNotificationAsRead(realId).catch(() => null);
      // بعد ما يتم تعليمه كمقروء، يفضل إعادة تحميل الإشعارات ليختفي المقروء وتتحدث القائمة
      loadNotifications();
    }

    setShowNotifications(false);

    if (n.type === "message" && n.chatUserId) {
      navigate(`/chat/${n.chatUserId}`);
      return;
    }

    if (n.type === "request") {
      if (role === "technician") navigate("/technician/requests");
      else navigate("/history");
      return;
    }

    navigate("/history");
  };

  return (
    <div className="navbar">
      <div className="navbar-brand" onClick={goHome}>
        Maintenance System
      </div>

      <div className="navbar-links">
        {role === "technician" ? (
          <>
            <button className="link-button" onClick={() => navigate("/technician-dashboard")}>
              Dashboard
            </button>
            <button className="link-button" onClick={() => navigate("/profile")}>
              Profile
            </button>
            <button className="link-button" onClick={() => navigate("/ai")}>
              AI Assistant
            </button>
            <button className="link-button" onClick={() => navigate("/chat")}>
              Chat
            </button>
          </>
        ) : role === "admin" ? (
          <button className="link-button" onClick={() => navigate("/admin")}>
            Dashboard
          </button>
        ) : (
          <>
            <button className="link-button" onClick={() => navigate("/home")}>
              Home
            </button>
            <button className="link-button" onClick={() => navigate("/history")}>
              Requests History
            </button>
            <button className="link-button" onClick={() => navigate("/profile")}>
              Profile
            </button>
            <button className="link-button" onClick={() => navigate("/ai")}>
              AI Assistant
            </button>
            <button className="link-button" onClick={() => navigate("/chat")}>
              Chat
            </button>
          </>
        )}
      </div>

      <div className="navbar-actions">
        <div className="notification-wrapper">
          <button
            className="icon-button"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            🔔
          </button>

          {notifications.length > 0 && (
            <span className="badge">
              {notifications.length}
            </span>
          )}

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-title">
                Notifications
              </div>

              <ul>
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      className="notification-item"
                      onClick={() => handleNotificationClick(n)}
                    >
                      <div className="notification-item-title">
                        {n.title}
                      </div>

                      
                      <div className="notification-item-body">
                        {n.body} 
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <button className="logout-btn" onClick={logout}>
          Log Out
        </button>
      </div>
    </div>
  );
}

export default Header;