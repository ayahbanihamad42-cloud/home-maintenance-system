import React, {useEffect, useState } from "react";
import { chatWithAI } from "../services/aiService";
import Header from "../components/common/Header";
import "../index.css";
import aiimage from "../images/aiassistant.png";

function AIChat() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm your ServiceHub AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if(!input) return;
    const outgoing = input;
    setMessages((prev) => [...prev, { role: "user", text: outgoing }]);
    setInput("");
    try {
      const response = await chatWithAI(outgoing);
      setMessages((prev) => [...prev, { role: "ai", text: response.reply }]);
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: "AI service is unavailable right now." }]);
    }
  };

  return (
    <>
      <Header />
      <div className="chat-wrapper">
        <div className="chat-shell chat-shell--ai">
          <div className="chat-header-bar">
            <div className="chat-avatar"><img src={aiimage} alt="AI Assistant" /></div>
            <div className="chat-title-block">
              <h3>AI Assistant</h3>
              <span>Always available</span>
            </div>
          </div>
          <div className="messages-container">
            {messages.map((m, i) => (
              <div key={i} className={`message-bubble ${m.role === "ai" ? "other-message" : "my-message"}`}>
                {m.text}
              </div>
            ))}
          </div>
          <div className="chat-input-area">
            <input
              className="chat-input"
              placeholder="Ask me anything..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="send-btn" onClick={handleSend}>Send</button>
          </div>
        </div>
      </div>
    </>
  );
}
export default AIChat;
