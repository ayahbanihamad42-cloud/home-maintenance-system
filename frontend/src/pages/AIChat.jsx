import React, { useState } from "react";
import AIBox from "../../src/components/chat/AIChatBox.jsx";
import { chatWithAI } from "../services/aiService";

function AIChat() {
  const [reply, setReply] = useState("");

  const ask = async message => {
    const res = await chatWithAI(message);
    setReply(res.reply);
  };

  return (
    <div className="container">
      <h2>AI Assistant</h2>
      <AIBox onAsk={ask} />
      {reply && <div className="card">{reply}</div>}
    </div>
  );
}

export default AIChat;
