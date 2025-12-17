import React, { useEffect, useState } from "react";
import { getChatByRequest, sendMessage } from "../services/chatService";
import { useParams } from "react-router-dom";

function Chat() {
  const { requestId } = useParams();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");

  useEffect(() => {
    getChatByRequest(requestId).then(setMessages);
  }, [requestId]);

  const handleSend = async () => {
    const msg = await sendMessage(requestId, { message: text, sender: "user" });
    setMessages([...messages, msg]);
    setText("");
  };

  return (
    <div className="container">
      <div className="chat-box">
        {messages.map((m,i) => (
          <div key={i} className={m.sender === "user" ? "chat-user" : "chat-technician"}>
            {m.message}
          </div>
        ))}
      </div>
      <div className="input-group">
        <input value={text} onChange={e => setText(e.target.value)} />
        <button className="primary" onClick={handleSend}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
