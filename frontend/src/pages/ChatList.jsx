import React, { useEffect, useState } from "react";
import Header from "../components/common/Header";
import API from "../services/api";
import { useNavigate } from "react-router-dom";

function ChatList() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState("");

  const loadConversations = async () => {
    try {
      setError("");
      const res = await API.get("/chat/conversations");
      setConversations(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("chat conversations error:", err);
      setError(err.response?.data?.message || "Failed to load conversations.");
      setConversations([]);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  return (
    <>
      <Header />

      <main className="chat-list-container">
        <section className="page-hero">
          <h1>Messages</h1>
          <p>Continue your conversations with users and technicians.</p>
        </section>

        {error && <div className="auth-error">{error}</div>}

        {conversations.length === 0 ? (
          <section className="card">
            <h3>No conversations yet</h3>
            <p>Your messages will appear here once you start chatting.</p>
          </section>
        ) : (
          <section className="chat-list-grid">
            {conversations.map((item) => (
              <article
                className="chat-list-card"
                key={item.userId || item.id}
                onClick={() => navigate(`/chat/${item.userId || item.id}`)}
              >
                <div className="chat-avatar">
                  {String(item.name || "U").charAt(0).toUpperCase()}
                </div>

                <div className="chat-list-info">
                  <h3>{item.name || "User"}</h3>

                  <p>
                    {item.lastMessageType === "image"
                      ? "📷 Image"
                      : item.lastMessageType === "location"
                      ? "📍 Location"
                      : item.lastMessage || "No messages yet"}
                  </p>
                </div>

                <span className="status-badge">Open</span>
              </article>
            ))}
          </section>
        )}
      </main>
    </>
  );
}

export default ChatList;