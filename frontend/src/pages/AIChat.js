import React, { useEffect, useState } from "react";
import { sendAIMessage, getAIChatHistory } from "../services/aiService";

function AIChat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    getAIChatHistory().then(setMessages);
  }, []);

  const handleSend = async () => {
    const reply = await sendAIMessage(input);
    setMessages([...messages, { sender: "user", message: input }, { sender: "ai", message: reply }]);
    setInput("");
  };

  return (
    <div className="container">
      <div className="chat-box">
        {messages.map((m,i) => (
          <div key={i} className={m.sender === "user" ? "chat-user" : "chat-ai"}>
            {m.message}
          </div>
        ))}
      </div>
      <div className="input-group">
        <input value={input} onChange={e => setInput(e.target.value)} />
        <button className="primary" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default AIChat;
