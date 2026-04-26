import React, { useEffect, useState, useContext, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/common/Header";
import { AuthContext } from "../Context/AuthContext";
import { sendChatMessage, getChatMessages } from "../services/chatService.jsx";
import "../index.css";

function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatMessage, setChatMessage] = useState(null);

  const fileInputRef = useRef(null);
  const endRef = useRef(null);

  const loadMessages = () => {
    getChatMessages(userId)
      .then((data) => setMessages(data || []))
      .catch(() => {
        setMessages([]);
        setChatMessage({
          type: "error",
          title: "Notice",
          body: "Failed to load chat messages.",
        });
      });
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content = null, type = "text") => {
    const messageValue = content || text;

    if (!messageValue.trim() && type === "text") return;

    const pending = {
      sender_id: user?.id,
      receiver_id: Number(userId),
      message: messageValue,
      type,
    };

    setMessages((prev) => [...prev, pending]);

    try {
      await sendChatMessage({
        receiver_id: Number(userId),
        message: messageValue,
        type,
      });
      setChatMessage(null);
    } catch (e) {
      console.error(e);
      setChatMessage({
        type: "error",
        title: "Notice",
        body: "Failed to send message.",
      });
    }

    if (type === "text") setText("");
    loadMessages();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      handleSend(reader.result, "image");
    };
    reader.readAsDataURL(file);
  };

  const shareLocation = () => {
    if (!navigator.geolocation) {
      setChatMessage({
        type: "warning",
        title: "Notice",
        body: "Geolocation is not supported by this browser.",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const locString = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;
        handleSend(locString, "location");
      },
      () => {
        setChatMessage({
          type: "warning",
          title: "Notice",
          body: "Unable to access location.",
        });
      }
    );
  };

  return (
    <>
      <Header />

      <div className="chat-page-shell">
        <div className="chat-page-topbar">
          <button className="secondary" onClick={() => navigate("/chat")}>
            Back to Chats
          </button>
        </div>

        <div className="chat-wrapper">
          <div className="chat-shell">
            <div className="chat-header-bar">
              <div className="chat-avatar">💬</div>
              <div className="chat-title-block">
                <h3>Conversation</h3>
                <span>Messages update automatically</span>
              </div>
            </div>

            {chatMessage ? (
              <div className={`message-box-card compact-message-card ${chatMessage.type}`}>
                <div className="message-box-title">{chatMessage.title}</div>
                <div className="message-box-body">{chatMessage.body}</div>
              </div>
            ) : null}

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="message-box-card">
                  <div className="message-box-title">No messages yet</div>
                  <div className="message-box-body">
                    Start the conversation by sending the first message.
                  </div>
                </div>
              ) : (
                messages.map((m, i) => (
                  <div
                    key={i}
                    className={`message-bubble ${
                      m.sender_id === user?.id ? "my-message" : "other-message"
                    }`}
                  >
                    {m.type === "image" ? (
                      <img
                        src={m.message}
                        alt="sent"
                        style={{ maxWidth: "200px", borderRadius: "8px" }}
                      />
                    ) : m.type === "location" ? (
                      <a href={m.message} target="_blank" rel="noreferrer">
                        📍 Open Location
                      </a>
                    ) : (
                      m.message
                    )}
                  </div>
                ))
              )}

              <div ref={endRef} />
            </div>

            <div className="chat-input-area">
              <input
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                ref={fileInputRef}
                onChange={handleImageUpload}
              />

              <button
                className="icon-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
              >
                📷
              </button>

              <button className="icon-btn" type="button" onClick={shareLocation}>
                📍
              </button>

              <input
                className="chat-input"
                placeholder="Type a message..."
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
              />

              <button className="send-btn" onClick={() => handleSend()}>
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;