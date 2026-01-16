// Import React and required hooks
import React, { useEffect, useState, useContext } from "react";

// Import URL parameters hook
import { useParams } from "react-router-dom";

// Import authentication context
import { AuthContext } from "../Context/AuthContext";

// Import chat services for sending and fetching messages
import { sendChatMessage, getChatMessages } from "../services/chatService.jsx";

// Import global styles
import "../index.css";

// Chat component
function Chat() {
  // Get userId from URL (chat partner)
  const { userId } = useParams();

  // Get logged-in user from AuthContext
  const { user } = useContext(AuthContext);

  // State to store chat messages
  const [messages, setMessages] = useState([]);

  // State to store current input text
  const [text, setText] = useState("");

  // Function to load chat messages from the server
  const loadMessages = () => {
    getChatMessages(userId)
      .then((data) => setMessages(data || []))
      .catch(() => setMessages([]));
  };

  // Load messages initially and poll every 3 seconds
  useEffect(() => {
    loadMessages();

    // Refresh messages periodically
    const interval = setInterval(loadMessages, 3000);

    // Clear interval when component unmounts
    return () => clearInterval(interval);
  }, [userId]);

  // Function to send a new message
  const handleSend = async () => {
    // Prevent sending empty messages
    if (!text.trim()) return;

    // Create a temporary message object for instant UI update
    const pending = {
      sender_id: user?.id,
      receiver_id: Number(userId),
      message: text
    };

    // Optimistically add message to UI
    setMessages((prev) => [...prev, pending]);

    // Send message to the backend
    try {
      await sendChatMessage({
        receiver_id: Number(userId),
        message: text
      });
    } catch (e) {
      // If send fails, keep UI but you can alert if you want
      console.error(e);
    }

    // Clear input field
    setText("");

    // Reload messages to sync with server
    loadMessages();
  };

  return (
    <div className="chat-wrapper">
      <div className="chat-shell">
        {/* Chat header section */}
        <div className="chat-header-bar">
          <div className="chat-avatar">👷</div>
          <div className="chat-title-block">
            <h3>Technician Chat</h3>
            <span>Online</span>
          </div>
        </div>

        {/* Messages list */}
        <div className="messages-container">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`message-bubble ${
                m.sender_id === user?.id ? "my-message" : "other-message"
              }`}
            >
              {m.message}
            </div>
          ))}
        </div>

        {/* Chat input and send button */}
        <div className="chat-input-area">
          <input
            className="chat-input"
            placeholder="Type a message..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
          />
          <button className="send-btn" onClick={handleSend}>
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

// Export Chat component
export default Chat;
