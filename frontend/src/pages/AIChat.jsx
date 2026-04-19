import React, { useEffect, useState, useRef } from "react";
import { chatWithAI, generateAIImage } from "../services/aiService";
import Header from "../components/common/Header";
import "../index.css";
import aiimage from "../images/aiassistant.png";

function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm your ServiceHub AI assistant. I can chat and generate images for you!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const fallbackMessage = "حالياً ما قدرت أوصل للخدمة، جرّب ترجع لي بعد شوي.";

  const handleSend = async (content = null, type = "text") => {
    const messageValue = content || input;
    if (!messageValue.trim()) return;

    setMessages((prev) => [...prev, { role: "user", text: type === "text" ? messageValue : "Sent an image", image: type === "image" ? messageValue : null }]);
    if (type === "text") setInput("");
    setLoading(true);

    try {
      if (messageValue.toLowerCase().startsWith("/draw")) {
        const prompt = messageValue.replace("/draw", "").trim();
        const response = await generateAIImage(prompt);
        setMessages((prev) => [...prev, { role: "ai", text: `Here is your image for: ${prompt}`, image: response.url }]);
      } else {
        const response = await chatWithAI(messageValue);
        setMessages((prev) => [...prev, { role: "ai", text: response.reply }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: fallbackMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        handleSend(reader.result, "image");
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <Header />
      <div className="chat-wrapper">
        <div className="chat-shell chat-shell--ai">
          <div className="chat-header-bar">
            <div className="chat-avatar">
              <img src={aiimage} alt="AI Assistant" />
            </div>
            <div className="chat-title-block">
              <h3>AI Assistant</h3>
              <span>Ask for "/draw [prompt]" to generate images</span>
            </div>
          </div>

          <div className="messages-container">
            {messages.map((m, i) => (
              <div key={i} className={`message-bubble ${m.role === "ai" ? "other-message" : "my-message"}`}>
                {m.image && <img src={m.image} alt="content" style={{ maxWidth: '100%', borderRadius: '8px', marginBottom: '5px' }} />}
                <p>{m.text}</p>
              </div>
            ))}
            {loading && <div className="message-bubble other-message">Thinking...</div>}
          </div>

          <div className="chat-input-area">
            <input 
              type="file" 
              accept="image/*" 
              style={{ display: 'none' }} 
              ref={fileInputRef} 
              onChange={handleFileUpload} 
            />
            <button className="icon-btn" onClick={() => fileInputRef.current.click()}>📷</button>
            
            <input
              className="chat-input"
              placeholder="Ask anything or use /draw..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
            />
            <button className="send-btn" onClick={() => handleSend()}>
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AIChat;

