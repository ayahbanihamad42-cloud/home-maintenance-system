import React, { useEffect, useState, useContext, useRef } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import { sendChatMessage, getChatMessages } from "../services/chatService.jsx";
import "../index.css";

function Chat() {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const fileInputRef = useRef(null);

  const loadMessages = () => {
    getChatMessages(userId)
      .then((data) => setMessages(data || []))
      .catch(() => setMessages([]));
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleSend = async (content = null, type = "text") => {
    const messageValue = content || text;
    if (!messageValue.trim() && type === "text") return;

    const pending = {
      sender_id: user?.id,
      receiver_id: Number(userId),
      message: messageValue,
      type: type 
    };

    setMessages((prev) => [...prev, pending]);

    try {
      await sendChatMessage({
        receiver_id: Number(userId),
        message: messageValue,
        type: type
      });
    } catch (e) {
      console.error(e);
    }

    if (type === "text") setText("");
    loadMessages();
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSend(reader.result, "image");
      };
      reader.readAsDataURL(file);
    }
  };

  const shareLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const locString = `https://google.com{pos.coords.latitude},${pos.coords.longitude}`;
        handleSend(locString, "location");
      }, () => {
        alert("Unable to access location");
      });
    }
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-shell">
        <div className="chat-header-bar">
          <div className="chat-avatar">👷</div>
          <div className="chat-title-block">
            <h3>Technician Chat</h3>
            <span>Online</span>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`message-bubble ${m.sender_id === user?.id ? "my-message" : "other-message"}`}
            >
              {m.type === "image" ? (
                <img src={m.message} alt="sent" style={{ maxWidth: '200px', borderRadius: '8px' }} />
              ) : m.type === "location" ? (
                <a href={m.message} target="_blank" rel="noreferrer" style={{ color: 'inherit' }}>
                  📍 My Location
                </a>
              ) : (
                m.message
              )}
            </div>
          ))}
        </div>

        <div className="chat-input-area">
          <input
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            ref={fileInputRef}
            onChange={handleImageUpload}
          />
          
          <button className="icon-btn" onClick={() => fileInputRef.current.click()}>📷</button>
          <button className="icon-btn" onClick={shareLocation}>📍</button>

          <input
            className="chat-input"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="send-btn" onClick={() => handleSend()}>Send</button>
        </div>
      </div>
    </div>
  );
}

export default Chat;

