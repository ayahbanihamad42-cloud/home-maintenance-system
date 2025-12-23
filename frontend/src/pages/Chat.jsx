import React, { useEffect, useState } from "react";
import ChatBox from "../components/chat/ChatBox";
import { getChatMessages, sendChatMessage } from "../services/chatService";

function Chat({ request_id }) {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    getChatMessages(request_id).then(setMessages);
  }, [request_id]);

  const send = async text => {
    const msg = await sendChatMessage({
      request_id,
      sender: "user",
      message: text
    });
    setMessages([...messages, msg]);
  };

  return <ChatBox messages={messages} onSend={send} />;
}

export default Chat;
