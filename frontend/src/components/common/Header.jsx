import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getNotificationFeed } from "../../services/notificationService.jsx";

function Header() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role;
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationFeed, setNotificationFeed] = useState([]);
  const [latestChatUserId, setLatestChatUserId] = useState(null);
  const notificationRef = useRef(null);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    if (!user) return;
    getNotificationFeed()
      .then((data) => {
        const feed = data || [];
        setNotificationFeed(feed);
        const latestMessage = feed.find((item) => item.type === "message" && item.chatUserId);
        setLatestChatUserId(latestMessage?.chatUserId || null);
      })
      .catch(() => setNotificationFeed([]));
  }, [user]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  return (
    <div className="navbar">
      <div className="navbar-brand">Maintenance System</div>
      {user ? (
        <>
          <div className="navbar-links">
            {role === "technician" ? (
              <>
                <Link to="/technician/dashboard">Dashboard</Link>
                <Link to="/technician/requests">Requests</Link>
                <Link to="/technician/availability">Availability</Link>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    if (latestChatUserId) {
                      navigate(`/chat/${latestChatUserId}`);
                    }
                  }}
                >
                  Chat
                </button>
              </>
            ) : (
              <>
                <Link to="/home">Home</Link>
                <Link to="/history">Requests History</Link>
                <Link to="/profile">Profile</Link>
                <Link to="/ai-chat">AI Assistant</Link>
              </>
            )}
          </div>
          <div className="navbar-actions">
            <div className="notification-wrapper" ref={notificationRef}>
              <button
                className="icon-button"
                type="button"
                aria-label="Notifications"
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                🔔
              </button>
              {showNotifications ? (
                <div className="notification-dropdown">
                  <div className="notification-title">Notifications</div>
                  {notificationFeed.length === 0 ? (
                    <div className="notification-empty">No notifications yet.</div>
                  ) : (
                    <ul>
                      {notificationFeed.map((item) => (
                        <li key={item.id}>
                          <button
                            type="button"
                            className="notification-item"
                            onClick={() => {
                              setShowNotifications(false);
                              if (item.type === "message" && item.chatUserId) {
                                navigate(`/chat/${item.chatUserId}`);
                              } else if (item.type === "request") {
                                if (role === "technician") {
                                  navigate("/technician/requests");
                                } else if (item.requestId) {
                                  navigate(`/review/${item.requestId}`);
                                }
                              }
                            }}
                          >
                            <div className="notification-item-title">{item.title}</div>
                            <div className="notification-item-body">{item.body}</div>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : null}
            </div>
            <button className="logout-btn" onClick={handleLogout}>Log Out</button>
          </div>
        </>
      ) : (
        <div className="navbar-links">Welcome to our Home Maintenance System</div>
      )}
    </div>
  );
}

export default Header;
