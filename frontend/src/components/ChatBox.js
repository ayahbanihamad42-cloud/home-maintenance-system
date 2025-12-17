import React, { useEffect, useRef, useState } from "react";

function ChatBox({ messages, onSend }) {
  const [text, setText] = useState("");
  const chatEndRef = useRef(null);

  const handleSend = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div>
      <div className="chat-box">
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.sender}`}>
            <div>{msg.message}</div>
            <small>{new Date(msg.timestamp).toLocaleString()}</small>
          </div>
        ))}
        <div ref={chatEndRef}></div>
      </div>
      <div style={{ display: "flex", gap: "10px" }}>
        <input value={text} onChange={e => setText(e.target.value)}
               onKeyDown={e => e.key === "Enter" && handleSend()} />
        <button className="primary" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default ChatBox;
