import React, { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../components/common/Header";
import { chatWithAI } from "../services/aiService";

function AIChat() {
  const { t } = useTranslation();
  const fileRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: t("aiChat.greeting"),
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
      text: cleanInput || t("aiChat.sentImage"),
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
          text: res.reply || t("aiChat.notAvailable"),
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
            t("aiChat.error"),
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

          {loading && <div className="ai-message">{t("aiChat.thinking")}</div>}
        </section>

        {image && (
          <div className="selected-image-preview">
            <img src={image} alt="selected" />

            <button className="secondary-btn" onClick={() => setImage(null)}>
              {t("aiChat.remove")}
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
            {t("chat.image")}
          </button>
        </div>

        <div className="ai-chat-input">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("aiChat.askPlaceholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter") send();
            }}
          />

          <button className="primary" onClick={send}>
            {t("aiChat.send")}
          </button>
        </div>
      </main>
    </>
  );
}

export default AIChat;