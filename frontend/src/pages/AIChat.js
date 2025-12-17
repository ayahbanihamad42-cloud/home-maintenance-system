import React, { useState, useEffect } from "react";
import { sendAIMessage, getAIChatHistory } from "../services/aiService";

function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await getAIChatHistory();
        setMessages(data);
      } catch (error) {
        alert(error.message);
      }
    };
    fetchHistory();
  }, []);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      const reply = await sendAIMessage(input);
      setMessages(prev => [...prev, { sender: "user", message: input }, { sender: "ai", message: reply }]);
      setInput("");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container">
      <h2>AI Chat</h2>
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.sender === "user" ? "chat-user" : "chat-ai"}>
            {msg.message}
          </div>
        ))}
      </div>
      <div className="input-group">
        <input value={input} onChange={e => setInput(e.target.value)} placeholder="Type your message..." />
        <button className="primary" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default AIChat;
