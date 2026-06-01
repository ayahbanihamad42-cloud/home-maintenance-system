import React, { useRef, useState } from "react";
import Header from "../components/common/Header";
import { chatWithAI } from "../services/aiService";

function AIChat() {
  const fileRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm your خدمة AI assistant. You can ask about repairs, decoration ideas, services, or send an image.",
    },
  ]);

  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setImage(reader.result);
    };

    reader.readAsDataURL(file);
  };

  const send = async () => {
    const cleanInput = input.trim();

    if (!cleanInput && !image) return;

    const userMessage = {
      role: "user",
      text: cleanInput || "Sent an image",
      image,
    };

    setMessages((prev) => [...prev, userMessage]);

    const textToSend = cleanInput;
    const imageToSend = image;

    setInput("");
    setImage(null);

    if (fileRef.current) {
      fileRef.current.value = "";
    }

    try {
      setLoading(true);

      const res = await chatWithAI(textToSend, imageToSend);

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
            "Sorry, something went wrong. Please try again.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <main className="ai-chat-container">
        <div className="ai-chat-header">AI Assistant</div>

        <section className="ai-chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`ai-message ${msg.role === "user" ? "user-message" : ""}`}
            >
              {msg.image && (
                <img
                  className="chat-message-image"
                  src={msg.image}
                  alt="AI upload"
                />
              )}

              <div>{msg.text}</div>
            </div>
          ))}

          {loading && <div className="ai-message">Thinking...</div>}
        </section>

        {image && (
          <div className="selected-image-preview">
            <img src={image} alt="selected" />

            <button className="secondary-btn" onClick={() => setImage(null)}>
              Remove
            </button>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleImage}
        />

        <div className="chat-tools">
          <button
            className="chat-tool-btn"
            type="button"
            onClick={() => fileRef.current?.click()}
          >
            📷 Image
          </button>
        </div>

        <div className="ai-chat-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
          />

          <button className="primary" onClick={send}>
            Send
          </button>
        </div>
      </main>
    </>
  );
}

export default AIChat;