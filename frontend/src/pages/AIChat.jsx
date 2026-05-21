import React, { useState } from "react";
import Header from "../components/common/Header";
import API from "../services/api";

function AIChat() {
  const [message, setMessage] = useState("");
  const [image, setImage] = useState(null);

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I'm your ServiceHub AI assistant.",
    },
  ]);

  const sendMessage = async () => {
    if (!message && !image) return;

    const formData = new FormData();

    formData.append("message", message);

    if (image) {
      formData.append("image", image);
    }

    try {
      const res = await API.post(
        "/ai/chat",
        formData,
        {
          headers: {
            "Content-Type":
              "multipart/form-data",
          },
        }
      );

      setMessages((prev) => [
        ...prev,
        {
          sender: "user",
          text: message,
          image: image
            ? URL.createObjectURL(image)
            : null,
        },
        {
          sender: "ai",
          text: res.data.reply,
        },
      ]);

      setMessage("");

      setImage(null);

      document.getElementById(
        "ai-image-input"
      ).value = "";
    } catch (err) {
      console.error(err);
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

              <span>
                Send text or image
              </span>
            </div>
          </div>

          <div className="messages-container">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`message-bubble ${
                  msg.sender === "user"
                    ? "my-message"
                    : "other-message"
                }`}
              >
                {msg.image && (
                  <img
                    src={msg.image}
                    alt=""
                    style={{
                      width: "100%",
                      borderRadius: 12,
                      marginBottom: 10,
                    }}
                  />
                )}

                {msg.text}
              </div>
            ))}
          </div>

          <div className="chat-input-area">
            <input
              type="file"
              id="ai-image-input"
              accept="image/*"
              onChange={(e) =>
                setImage(e.target.files[0])
              }
            />

            <input
              type="text"
              placeholder="Ask anything..."
              value={message}
              onChange={(e) =>
                setMessage(e.target.value)
              }
            />

            <button
              className="send-btn"
              onClick={sendMessage}
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