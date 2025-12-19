import React, { useEffect, useState } from "react";
import { chatWithAI, getAIResponses } from "../services/aiService";
import { useNavigate } from "react-router-dom";
import profileaichat from "../images/aiassistant.png";
function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user) {
      getAIResponses(user.id).then(setMessages);
    }
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    const reply = await chatWithAI({ message: input });
    setMessages([
      ...messages,
      { sender: "user", message: input, time: new Date().toLocaleTimeString() },
      { sender: "ai", message: reply, time: new Date().toLocaleTimeString() }
    ]);
    setInput("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
        <button className="back-button" onClick={() => navigate(-1)}>←</button>
        <img src={profileaichat} alt="AI" />
        <span>AI Assistant</span>
      </div>
      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} className={`message message-${m.sender}`}>
            {m.message}
            <div className="timestamp">{m.time}</div>
          </div>
        ))}
      </div>
      <div className="input-group">
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Type a message..."
        />
        <button className="primary" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default AIChat;
