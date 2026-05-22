import React, { useEffect, useMemo, useState } from "react";
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

  const unreadCount = useMemo(() => notifications.length, [notifications]);

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

    const timer = setInterval(loadNotifications, 8000);

    return () => clearInterval(timer);
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
      await loadNotifications();
    }

    setShowNotifications(false);

    if (n.type === "message" && n.chatUserId) {
      navigate(`/chat/${n.chatUserId}`);
      return;
    }

    if (n.type === "request" && n.requestId) {
      if (role === "technician") navigate("/technician/requests");
      else navigate(`/review/${n.requestId}`);
      return;
    }

    if (role === "technician") navigate("/technician/requests");
    else navigate("/history");
  };

  return (
    <div className="navbar">
      <button className="navbar-brand link-button" onClick={goHome}>
        Maintenance System
      </button>

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
            type="button"
            onClick={() => setShowNotifications((prev) => !prev)}
          >
            🔔
          </button>

          {unreadCount > 0 && <span className="badge">{unreadCount}</span>}

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-title">Notifications</div>

              {notifications.length === 0 ? (
                <div className="notification-empty">No notifications.</div>
              ) : (
                <ul>
                  {notifications.map((n) => (
                    <li key={n.id}>
                      <button
                        type="button"
                        className="notification-item"
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className="notification-item-title">
                          {n.title || "Notification"}
                        </div>

                        <div className="notification-item-body">
                          {n.body || n.message || ""}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
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