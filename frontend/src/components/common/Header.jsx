// React library and hooks
import React, { useEffect, useRef, useState } from "react";

// Routing utilities
import { Link, useNavigate } from "react-router-dom";

// Notification service
import { getNotifications } from "../../services/notificationService.jsx";

// Header / Navbar component
function Header() {
  // Navigation handler
  const navigate = useNavigate();

  // Get logged-in user from localStorage
  const user = JSON.parse(localStorage.getItem("user"));

  // User role (technician or customer)
  const role = user?.role;

  // Toggle notification dropdown
  const [showNotifications, setShowNotifications] = useState(false);

  // Store notification list
  const [notificationFeed, setNotificationFeed] = useState([]);

  // Store last chat user id
  const [latestChatUserId, setLatestChatUserId] = useState(null);

  // Reference to notification dropdown
  const notificationRef = useRef(null);

  // Handle user logout
  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  useEffect(() => {
    // Fetch notifications on load
    if (!user) return;

    // Call notification feed API service
    const req = getNotifications();

    // Safety: prevent crash if service returns undefined
    if (!req || typeof req.then !== "function") {
      setNotificationFeed([]);
      return;
    }

    req
      .then((res) => {
        const feed = res?.data || [];
        setNotificationFeed(feed);

        // Find latest chat notification
        const latestMessage = feed.find(
          (item) => item.type === "message" && item.chatUserId
        );
        setLatestChatUserId(latestMessage?.chatUserId || null);
      })
      .catch(() => setNotificationFeed([]));
  }, [user]);

  useEffect(() => {
    // Close notifications when clicking outside
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
      {/* App name */}
      <div className="navbar-brand">Maintenance System</div>

      {user ? (
        <>
          {/* Navigation links */}
          <div className="navbar-links">
            {role === "technician" ? (
              <>
                <Link to="/technician/dashboard">Dashboard</Link>
                <Link to="/technician/requests">Requests</Link>
                <Link to="/technician/availability">Availability</Link>

                {/* Chat link */}
                {latestChatUserId ? (
                  <Link to={`/chat/${latestChatUserId}`}>Chat</Link>
                ) : (
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => alert("No chats yet")}
                  >
                    Chat
                  </button>
                )}
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

          {/* Actions area */}
          <div className="navbar-actions">
            <div className="notification-wrapper" ref={notificationRef}>
              {/* Notification toggle */}
              <button
                className="icon-button"
                type="button"
                aria-label="Notifications"
                onClick={() => setShowNotifications((prev) => !prev)}
              >
                🔔
              </button>

              {/* Notification dropdown */}
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

                              // Navigate based on notification type
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

            {/* Logout button */}
            <button className="logout-btn" onClick={handleLogout}>
              Log Out
            </button>
          </div>
        </>
      ) : (
        <div className="navbar-links">Welcome to our Home Maintenance System</div>
      )}
    </div>
  );
}

// Export component
export default Header;
