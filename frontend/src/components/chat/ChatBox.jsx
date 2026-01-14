 // React library and hooks
import React, { useState, useEffect, useRef } from "react";

  // Chat box component
function ChatBox({ messages, onSend }) {

   // State for current input text
  const [text, setText] = useState("");
   // Reference to last message
  const endRef = useRef(null);

   // Handle sending message
   const send = () => {

   // Prevent sending empty messages
    if (!text.trim()) return;
   // Send message to parent component
    onSend(text);
   // Clear input after send
    setText("");
  };

  useEffect(() => {
   // Auto scroll on new message
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
      <div className="chat-wrapper">
       {/* Chat messages container */}
      <div className="chat-box">
        {messages.map((m, i) => (
        <div key={i} className={`chat-message ${m.sender}`}>
         {/* Display message text */}
            {m.message}
          </div>
        ))}

          {/* Scroll anchor */}
          <div ref={endRef} />
           </div>

        {/* Chat input section */}
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
  // Export component
export default ChatBox;

