import React, { useEffect, useRef, useState } from "react";
import Header from "../components/common/Header";
import { chatWithAI, getAIResponses } from "../services/aiService";

function AIChat() {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm your ServiceHub AI assistant. Send text or image.",
    },
  ]);

  const [text, setText] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const fileRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    getAIResponses(user.id)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setMessages(data);
        }
      })
      .catch(() => {});
  }, [user.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setSelectedImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const handleSend = async () => {
    const cleanText = text.trim();

    if (!cleanText && !selectedImage) return;

    const userMessage = {
      role: "user",
      text: cleanText || "Sent an image",
      image: selectedImage,
    };

    setMessages((prev) => [...prev, userMessage]);

    const imageToSend = selectedImage;

    setText("");
    setSelectedImage(null);
    if (fileRef.current) fileRef.current.value = "";

    try {
      setLoading(true);

      const res = await chatWithAI(cleanText, imageToSend);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: res.reply || "AI assistant is not available right now.",
          image: res.image || res.url || null,
        },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text:
            err.response?.data?.reply ||
            "صار خطأ بالمساعد. جرّبي مرة ثانية.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="chat-wrapper">
        <div className="chat-shell ai-shell">
          <div className="chat-header-bar">
            <div className="chat-avatar">🤖</div>

            <div className="chat-title-block">
              <h3>AI Assistant</h3>
              <span>Send text or image</span>
            </div>
          </div>

          <div className="messages-container">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-bubble ${
                  msg.role === "user" ? "my-message" : "other-message"
                }`}
              >
                {msg.image && (
                  <img src={msg.image} alt="uploaded" />
                )}

                <div>{msg.text}</div>
              </div>
            ))}

            {loading && (
              <div className="message-bubble other-message">
                Thinking...
              </div>
            )}

            <div ref={bottomRef} />
          </div>

          {selectedImage && (
            <div className="message-box-card compact-message-card">
              <div className="message-box-title">Selected Image</div>
              <img
                src={selectedImage}
                alt="preview"
                style={{
                  width: "120px",
                  borderRadius: "12px",
                  display: "block",
                  marginBottom: "10px",
                }}
              />

              <button
                className="secondary"
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  if (fileRef.current) fileRef.current.value = "";
                }}
              >
                Remove
              </button>
            </div>
          )}

          <div className="chat-input-area">
            <button
              type="button"
              className="btn-outline"
              onClick={() => fileRef.current?.click()}
            >
              📷
            </button>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              hidden
              onChange={handleImageChange}
            />

            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ask anything..."
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSend();
              }}
            />

            <button
              type="button"
              className="send-btn"
              onClick={handleSend}
              disabled={loading}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AIChat;