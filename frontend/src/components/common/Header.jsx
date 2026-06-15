import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../Context/ThemeContext";
import {
  getNotificationFeed,
  markNotificationAsRead,
} from "../../services/notificationService.jsx";
import {
  getChatConversations,
  getChatMessages,
  sendChatMessage,
} from "../../services/chatService.jsx";
import { chatWithAI } from "../../services/aiService";

function Header() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const role = String(user.role || "").toLowerCase();

  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [openWidget, setOpenWidget] = useState("");

  const [conversations, setConversations] = useState([]);
  const [selectedChatUser, setSelectedChatUser] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const chatFileRef = useRef(null);

  const [aiMessages, setAiMessages] = useState([
    { role: "ai", text: t("aiChat.greeting") },
  ]);
  const [aiText, setAiText] = useState("");
  const [aiImage, setAiImage] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const aiFileRef = useRef(null);

  const unreadCount = useMemo(() => notifications.length, [notifications]);

  const currentLang = i18n.language?.startsWith("ar") ? "ar" : "en";

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  };

  useEffect(() => {
    const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", lang);
  }, [i18n.language]);

  const loadNotifications = async () => {
    try {
      const data = await getNotificationFeed();
      setNotifications(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("notifications error:", err);
      setNotifications([]);
    }
  };

  const loadConversations = async () => {
    try {
      const data = await getChatConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch {
      setConversations([]);
    }
  };

  const loadChatMessages = async (chatUserId) => {
    if (!chatUserId) return;
    try {
      const data = await getChatMessages(chatUserId);
      setChatMessages(Array.isArray(data) ? data : []);
    } catch {
      setChatMessages([]);
    }
  };

  useEffect(() => {
    loadNotifications();
    const timer = setInterval(loadNotifications, 8000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (openWidget === "chat") loadConversations();
  }, [openWidget]);

  useEffect(() => {
    if (!selectedChatUser?.userId) return;
    loadChatMessages(selectedChatUser.userId);
    const timer = setInterval(
      () => loadChatMessages(selectedChatUser.userId),
      3000
    );
    return () => clearInterval(timer);
  }, [selectedChatUser?.userId]);

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
      setOpenWidget("chat");
      const selected = {
        userId: n.chatUserId,
        name: n.sender_name || "User",
      };
      setSelectedChatUser(selected);
      await loadChatMessages(n.chatUserId);
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

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();

      reader.onload = () => {
        img.src = reader.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 700;
        const scale = Math.min(maxWidth / img.width, 1);
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", 0.55));
      };

      reader.onerror = reject;
      img.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendChat = async (content = null, type = "text") => {
    const receiverId = selectedChatUser?.userId;
    if (!receiverId) return;

    const value = String(content ?? chatText ?? "");
    if (type === "text" && !value.trim()) return;
    if (type !== "text" && !value) return;

    try {
      await sendChatMessage({
        receiver_id: Number(receiverId),
        message: value,
        type,
      });

      if (type === "text") setChatText("");
      await loadChatMessages(receiverId);
      await loadConversations();
    } catch (err) {
      console.error("send chat error:", err);
    }
  };

  const handleChatImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const image = await compressImage(file);
      await sendChat(image, "image");
      e.target.value = "";
    } catch {
      console.error("failed to send image");
    }
  };

  const handleChatLocation = () => {
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(async (pos) => {
      const { latitude, longitude } = pos.coords;
      const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
      await sendChat(url, "location");
    });
  };

  const renderChatMessage = (msg) => {
    if (msg.type === "image") {
      return <img className="chat-message-image" src={msg.message} alt="sent" />;
    }

    if (msg.type === "location") {
      return (
        <a href={msg.message} target="_blank" rel="noreferrer">
          {t("chat.openSharedLocation")}
        </a>
      );
    }

    return msg.message;
  };

  const handleAIImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setAiImage(reader.result);
    reader.readAsDataURL(file);
  };

  const sendAI = async () => {
    const cleanText = aiText.trim();
    if (!cleanText && !aiImage) return;

    const userMessage = {
      role: "user",
      text: cleanText || t("aiChat.sentImage"),
      image: aiImage,
    };

    setAiMessages((prev) => [...prev, userMessage]);

    const imageToSend = aiImage;
    setAiText("");
    setAiImage(null);

    if (aiFileRef.current) aiFileRef.current.value = "";

    try {
      setAiLoading(true);
      const res = await chatWithAI(cleanText, imageToSend);

      setAiMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: res.reply || t("aiChat.notAvailable"),
          image: res.image || res.url || null,
        },
      ]);
    } catch (err) {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            err.response?.data?.reply || t("aiChat.error"),
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <div className="navbar">
        <button className="navbar-brand link-button" onClick={goHome}>
          {t("brand")}
        </button>

        <div className="navbar-links">
          {role === "technician" ? (
            <>
              <button className="link-button" onClick={() => navigate("/technician-dashboard")}>
                {t("nav.dashboard")}
              </button>
              <button className="link-button" onClick={() => navigate("/technician/requests")}>
                {t("nav.requests")}
              </button>
              <button className="link-button" onClick={() => navigate("/profile")}>
                {t("nav.profile")}
              </button>
              <button className="link-button" onClick={() => setOpenWidget("ai")}>
                {t("nav.aiAssistant")}
              </button>
              <button className="link-button" onClick={() => setOpenWidget("chat")}>
                {t("nav.chat")}
              </button>
            </>
          ) : role === "admin" ? (
            <>
              <button className="link-button" onClick={() => navigate("/admin")}>
                {t("nav.dashboard")}
              </button>
            </>
          ) : (
            <>
              <button className="link-button" onClick={() => navigate("/home")}>
                {t("nav.home")}
              </button>
              <button className="link-button" onClick={() => navigate("/history")}>
                {t("nav.requests")}
              </button>
              <button className="link-button" onClick={() => navigate("/profile")}>
                {t("nav.profile")}
              </button>
              <button className="link-button" onClick={() => setOpenWidget("ai")}>
                {t("nav.aiAssistant")}
              </button>
              <button className="link-button" onClick={() => setOpenWidget("chat")}>
                {t("nav.chat")}
              </button>
            </>
          )}
        </div>

        <div className="navbar-actions">
          <div className="settings-toggles">
            <div className="toggle-group">
              <button
                className={`toggle-btn ${currentLang === "en" ? "active" : ""}`}
                onClick={() => changeLanguage("en")}
              >
                EN
              </button>
              <button
                className={`toggle-btn ${currentLang === "ar" ? "active" : ""}`}
                onClick={() => changeLanguage("ar")}
              >
                عربي
              </button>
            </div>

            <div className="toggle-divider" />

            <div className="toggle-group">
              <button
                className={`toggle-btn ${theme === "light" ? "active" : ""}`}
                onClick={() => theme !== "light" && toggleTheme()}
              >
                ☀️
              </button>
              <button
                className={`toggle-btn ${theme === "dark" ? "active" : ""}`}
                onClick={() => theme !== "dark" && toggleTheme()}
              >
                🌙
              </button>
            </div>
          </div>

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
                <div className="notification-title">{t("nav.notifications")}</div>

                {notifications.length === 0 ? (
                  <div className="notification-empty">{t("nav.noNotifications")}</div>
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
                            {n.title || t("nav.notification")}
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
            {t("nav.logout")}
          </button>
        </div>
      </div>

      <div className="khidma-floating-actions">
        <button
          className="khidma-fab"
          type="button"
          onClick={() => {
            setOpenWidget(openWidget === "chat" ? "" : "chat");
            setSelectedChatUser(null);
          }}
        >
          💬
        </button>

        <button
          className="khidma-fab"
          type="button"
          onClick={() => setOpenWidget(openWidget === "ai" ? "" : "ai")}
        >
          ✨
        </button>
      </div>

      {openWidget === "chat" && (
        <div className="khidma-popup khidma-chat-popup">
          <div className="khidma-popup-header">
            <h3>{selectedChatUser ? selectedChatUser.name : t("nav.chat")}</h3>
            <button className="link-button" onClick={() => setOpenWidget("")}>
              ✕
            </button>
          </div>

          <div className="khidma-popup-body">
            {!selectedChatUser ? (
              <>
                <p className="khidma-popup-text">{t("chat.chooseConversation")}</p>

                {conversations.length === 0 ? (
                  <div className="notification-empty">{t("chat.noConversations")}</div>
                ) : (
                  conversations.map((item) => (
                    <button
                      key={item.userId}
                      className="khidma-chip"
                      onClick={() => setSelectedChatUser(item)}
                    >
                      {item.name || "User"} —{" "}
                      {item.lastMessageType === "image"
                        ? t("chat.image")
                        : item.lastMessageType === "location"
                        ? t("chat.location")
                        : item.lastMessage || t("chat.noMessages")}
                    </button>
                  ))
                )}
              </>
            ) : (
              <>
                <div className="popup-messages">
                  {chatMessages.length === 0 ? (
                    <div className="notification-empty">{t("chat.noMessages")}</div>
                  ) : (
                    chatMessages.map((msg, index) => {
                      const mine = Number(msg.sender_id) === Number(user.id);
                      return (
                        <div
                          key={msg.id || index}
                          className={`popup-message ${mine ? "mine" : ""}`}
                        >
                          {renderChatMessage(msg)}
                        </div>
                      );
                    })
                  )}
                </div>

                <input
                  ref={chatFileRef}
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleChatImage}
                />

                <div className="chat-tools">
                  <button
                    className="chat-tool-btn"
                    type="button"
                    onClick={() => chatFileRef.current?.click()}
                  >
                    📷 {t("chat.image")}
                  </button>

                  <button
                    className="chat-tool-btn"
                    type="button"
                    onClick={handleChatLocation}
                  >
                    📍 {t("chat.location")}
                  </button>
                </div>

                <div className="khidma-popup-input">
                  <input
                    value={chatText}
                    onChange={(e) => setChatText(e.target.value)}
                    placeholder={t("chat.typePlaceholder")}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") sendChat();
                    }}
                  />
                  <button className="primary" onClick={() => sendChat()}>
                    {t("chat.send")}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {openWidget === "ai" && (
        <div className="khidma-popup khidma-chat-popup">
          <div className="khidma-popup-header">
            <h3>{t("nav.aiAssistant")}</h3>
            <button className="link-button" onClick={() => setOpenWidget("")}>
              ✕
            </button>
          </div>

          <div className="khidma-popup-body">
            <div className="popup-messages">
              {aiMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`popup-message ${msg.role === "user" ? "mine" : ""}`}
                >
                  {msg.image && (
                    <img className="chat-message-image" src={msg.image} alt="AI" />
                  )}
                  <div>{msg.text}</div>
                </div>
              ))}

              {aiLoading && <div className="popup-message">{t("aiChat.thinking")}</div>}
            </div>

            {aiImage && (
              <div className="selected-image-preview">
                <img src={aiImage} alt="selected" />
                <button
                  className="secondary-btn"
                  onClick={() => setAiImage(null)}
                >
                  {t("aiChat.remove")}
                </button>
              </div>
            )}

            <input
              ref={aiFileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleAIImage}
            />

            <div className="chat-tools">
              <button
                className="chat-tool-btn"
                type="button"
                onClick={() => aiFileRef.current?.click()}
              >
                📷 {t("chat.image")}
              </button>
            </div>

            <div className="khidma-popup-input">
              <input
                value={aiText}
                onChange={(e) => setAiText(e.target.value)}
                placeholder={t("aiChat.askPlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") sendAI();
                }}
              />
              <button className="primary" onClick={sendAI}>
                {t("aiChat.ask")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Header;
