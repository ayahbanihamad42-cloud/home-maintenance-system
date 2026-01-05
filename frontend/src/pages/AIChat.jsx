import React, { useState } from "react";
import { chatWithAI } from "../services/aiService";
import Header from "../components/common/Header";
import "../index.css";

function AIChat() {
  const [messages, setMessages] = useState([
    { role: "ai", text: "Hello! I'm your ServiceHub AI assistant. How can I help you today?" }
  ]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if(!input) return;
    setMessages([...messages, { role: "user", text: input }]);
    const outgoing = input;
    setMessages((prev) => [...prev, { role: "user", text: outgoing }]);
    setInput("");
    // هنا يتم استدعاء خدمة الـ AI لاحقاً
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
      
    </>
  );
}
export default AIChat;