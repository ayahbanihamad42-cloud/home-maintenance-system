import React, { useEffect, useState } from "react";
import { getChatMessages, sendChatMessage } from "../services/chatService";
import { useParams, useNavigate } from "react-router-dom";
import profileimage from "../images/profileaht.png";
function Chat() {
  const { requestId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    getChatMessages(requestId).then(setMessages);
  }, [requestId]);

  const handleSend = async () => {
    const msg = await sendChatMessage({ request_id: requestId, message: text, sender: "user" });
    setMessages([...messages, { ...msg, time: new Date().toLocaleTimeString() }]);
    setText("");
  };

  return (
    <div className="chat-container">
      <div className="chat-header">
      <button className="back-button" onClick={() => navigate(-1)}>←</button>
       <img src={profileimage} alt="profilechat" />
       <span>Technician Chat</span>
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
        <input value={text} onChange={e => setText(e.target.value)} placeholder="Type a message..." />
        <button className="primary" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
