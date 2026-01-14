// Import React and required hooks
import React, { useEffect, useState } from "react";

// Import AI chat service
import { chatWithAI } from "../services/aiService";

// Import shared Header component
import Header from "../components/common/Header";

// Import global styles
import "../index.css";

// Import AI assistant image
import aiimage from "../images/aiassistant.png";

// AI Chat page component
function AIChat() {

  // State to store chat messages (user and AI)
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm your ServiceHub AI assistant. How can I help you today?"
    }
  ]);

  // State to store user input text
  const [input, setInput] = useState("");

  // Fallback message if AI service fails
  const fallbackMessage =
    "حالياً ما قدرت أوصل للخدمة، جرّب ترجع لي بعد شوي.";

  // Function to send user message and get AI response
  const handleSend = async () => {

    // Prevent sending empty messages
    if (!input) return;

    // Store current input
    const outgoing = input;

    // Add user message to chat
    setMessages((prev) => [
      ...prev,
      { role: "user", text: outgoing }
    ]);

    // Clear input field
    setInput("");

    try {
      // Call AI service with user message
      const response = await chatWithAI(outgoing);

      // Add AI reply to chat
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: response.reply }
      ]);
    } catch (error) {
      // Show fallback message if request fails
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: fallbackMessage }
      ]);
    }
  };

  return (
    <>
      {/* Display main header */}
      <Header />

      {/* Chat page wrapper */}
      <div className="chat-wrapper">

        {/* Chat container styled for AI */}
        <div className="chat-shell chat-shell--ai">

          {/* Chat header section */}
          <div className="chat-header-bar">

            {/* AI avatar */}
            <div className="chat-avatar">
              <img src={aiimage} alt="AI Assistant" />
            </div>

            {/* Chat title and subtitle */}
            <div className="chat-title-block">
              <h3>AI Assistant</h3>
              <span>Availability depends on service status</span>
            </div>
          </div>

          {/* Messages display area */}
          <div className="messages-container">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`message-bubble ${
                  m.role === "ai" ? "other-message" : "my-message"
                }`}
              >
                {m.text}
              </div>
            ))}
          </div>

          {/* Chat input and send button */}
          <div className="chat-input-area">

            {/* Text input field */}
            <input
              className="chat-input"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) =>
                e.key === "Enter" && handleSend()
              }
            />

            {/* Send message button */}
            <button className="send-btn" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// Export AIChat component
export default AIChat;
