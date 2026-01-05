import React, { useState } from "react";
import "../index.css";

function AIChat() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm your ServiceHub AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if(!input) return;
    setMessages([...messages, { role: "user", text: input }]);
    setInput("");
    // هنا يتم استدعاء خدمة الـ AI لاحقاً
  };

  return (
    <div className="container chat-screen">
      <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column" }}>
        {messages.map((m, i) => (
          <div key={i} className={`chat-bubble ${m.role === "ai" ? "ai-bubble" : "user-bubble"}`}>
            {m.text}
          </div>
        ))}
      </div>
      <div className="chat-input-bar">
        <input placeholder="Ask me anything..." value={input} onChange={e => setInput(e.target.value)} />
        <button onClick={handleSend} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "20px" }}>➤</button>
      </div>
    </div>
  );
}
export default AIChat;