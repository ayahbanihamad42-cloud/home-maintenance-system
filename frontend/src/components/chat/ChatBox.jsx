import React, { useState, useEffect, useRef } from "react";

function ChatBox({ messages, onSend }) {
  const [text, setText] = useState("");
  const endRef = useRef(null);

  const send = () => {
    if (!text.trim()) return;
    onSend(text);
    setText("");
  };

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="chat-wrapper">
      <div className="chat-box">
        {messages.map((m, i) => (
          <div key={i} className={`chat-message ${m.sender}`}>
            {m.message}
          </div>
        ))}
        <div ref={endRef} />
      </div>

      <div className="chat-input">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === "Enter" && send()}
        />
        <button className="primary" onClick={send}>Send</button>
      </div>
    </div>
  );
}

export default ChatBox;
