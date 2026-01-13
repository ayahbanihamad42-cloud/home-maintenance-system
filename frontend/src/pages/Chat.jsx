import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";
import {sendChatMessage,getChatMessages} from "../services/chatService.jsx";
import "../index.css";

function Chat() {
  const { userId } = useParams();
  const { user } = useContext(AuthContext);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  const loadMessages = () => {
    getChatMessages(userId).then((data) => setMessages(data || []));
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleSend = async () => {
    if (!text.trim()) return;
    const pending = {
      sender_id: user?.id,
      receiver_id: Number(userId),
      message: text
    };
    setMessages((prev) => [...prev, pending]);
    await sendChatMessage({ receiver_id: userId, message: text });
    setText("");
    loadMessages();
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
            <div key={i} className={`message-bubble ${m.sender_id === user?.id ? "my-message" : "other-message"}`}>
              {m.message}
            </div>
          ))}
        </div>
        <div className="chat-input-area">
          <input
            className="chat-input"
            placeholder="Type a message..."
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="send-btn" onClick={handleSend}>Send</button>
        </div>
      </div>
    </div>
  );
}
export default Chat;
