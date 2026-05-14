import React, { useState, useRef } from "react";
import { chatWithAI } from "../services/aiService.jsx";
import Header from "../components/common/Header";
import "../index.css";
import aiimage from "../images/aiassistant.png";

function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm your ServiceHub AI assistant. Send text or image.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [lastImage, setLastImage] = useState(null);

  const fileInputRef = useRef(null);

  const fallbackMessage =
    "حالياً ما قدرت أوصل للخدمة، جرّب ترجع لي بعد شوي.";

  const handleSend = async () => {
    const messageValue = input.trim();

    if (!messageValue && !selectedImage) return;

    const imageToSend = selectedImage || lastImage;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: messageValue || "Sent an image",
        image: selectedImage,
      },
    ]);

    if (selectedImage) {
      setLastImage(selectedImage);
    }

    setInput("");
    setSelectedImage(null);
    setLoading(true);

    try {
      const response = await chatWithAI(
        messageValue || "Analyze this image.",
        imageToSend
      );

      setMessages((prev) => [
  ...prev,
  {
    role: "ai",
    text: response.reply,
image: response.url || response.image  }
]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: fallbackMessage,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };

    reader.readAsDataURL(file);

    e.target.value = "";
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
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
              <span>Send text or image</span>
            </div>
          </div>

          <div className="messages-container">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`message-bubble ${
                  m.role === "ai" ? "other-message" : "my-message"
                }`}
              >
                {m.image && (
                  <img
                    src={m.image}
                    alt="content"
                    style={{
                      maxWidth: "100%",
                      borderRadius: "8px",
                      marginBottom: "5px",
                    }}
                  />
                )}

                <p>{m.text}</p>
              </div>
            ))}

            {loading && (
              <div className="message-bubble other-message">Thinking...</div>
            )}
          </div>

          {selectedImage && (
            <div
              style={{
                padding: "10px 15px",
                display: "flex",
                alignItems: "center",
                gap: "10px",
              }}
            >
              <img
                src={selectedImage}
                alt="preview"
                style={{
                  maxWidth: "140px",
                  maxHeight: "100px",
                  borderRadius: "8px",
                }}
              />

              <button
                type="button"
                onClick={removeSelectedImage}
                style={{
                  border: "none",
                  background: "#111",
                  color: "#fff",
                  padding: "6px 10px",
                  borderRadius: "8px",
                  cursor: "pointer",
                }}
              >
                Remove
              </button>
            </div>
          )}

          <div className="chat-input-area">
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              ref={fileInputRef}
              onChange={handleFileUpload}
            />

            <button
              type="button"
              className="icon-btn"
              onClick={() => fileInputRef.current.click()}
            >
              📷
            </button>

            <input
              className="chat-input"
              placeholder="Ask anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />

            <button type="button" className="send-btn" onClick={handleSend}>
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AIChat;