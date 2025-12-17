import React, { useState, useEffect } from "react";
import { getChatByRequest, sendMessage } from "../services/chatService";
import { useParams } from "react-router-dom";

function Chat() {
  const { requestId } = useParams();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const data = await getChatByRequest(requestId);
        setMessages(data);
      } catch (error) {
        alert(error.message);
      }
    };
    fetchMessages();
  }, [requestId]);

  const handleSend = async () => {
    if (!input.trim()) return;
    try {
      const newMessage = await sendMessage(requestId, { message: input, sender: "user" });
      setMessages(prev => [...prev, newMessage]);
      setInput("");
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container">
      <h2>Chat with Technician</h2>
      <div className="chat-box">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.sender === "user" ? "chat-user" : "chat-technician"}>
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

export default Chat;
