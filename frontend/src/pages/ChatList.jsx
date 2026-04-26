import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/common/Header";
import { getChatConversations } from "../services/chatService.jsx";
import "../index.css";

function ChatList() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getChatConversations()
      .then((data) => {
        setConversations(data || []);
      })
      .catch(() => {
        setConversations([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const renderLastMessage = (item) => {
    if (item.lastMessageType === "image") return "📷 Image";
    if (item.lastMessageType === "location") return "📍 Location";
    return item.lastMessage || "No messages yet";
  };

  return (
    <>
      <Header />

      <div className="container chat-list-container">
        <h2>Chats</h2>

        {loading ? (
          <div className="message-box-card">
            <div className="message-box-title">Notice</div>
            <div className="message-box-body">Loading conversations...</div>
          </div>
        ) : conversations.length === 0 ? (
          <div className="message-box-card">
            <div className="message-box-title">No chats yet</div>
            <div className="message-box-body">
              Your conversations will appear here when you start chatting.
            </div>
          </div>
        ) : (
          <div className="chat-list-grid">
            {conversations.map((item) => (
              <button
                key={item.userId}
                type="button"
                className="chat-list-card"
                onClick={() => navigate(`/chat/${item.userId}`)}
              >
                <div className="chat-list-avatar">
                  {(item.name || "?").charAt(0).toUpperCase()}
                </div>

                <div className="chat-list-content">
                  <div className="chat-list-top">
                    <div className="chat-list-name">{item.name}</div>
                    <div className="chat-list-time">
                      {item.lastMessageAt
                        ? new Date(item.lastMessageAt).toLocaleString()
                        : ""}
                    </div>
                  </div>

                  <div className="chat-list-last-message">
                    {renderLastMessage(item)}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

export default ChatList;