import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../components/common/Header";
import API from "../services/api";
import { useParams } from "react-router-dom";

function Chat() {
  const { t } = useTranslation();
  const { userId } = useParams();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const fileRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([]);
  const [receiver, setReceiver] = useState(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const loadMessages = async () => {
    if (!userId) return;

    try {
      setError("");
      const res = await API.get(`/chat/${userId}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error("chat messages error:", err);
      setError(err.response?.data?.message || t("chat.failedToLoad"));
      setMessages([]);
    }
  };

  const loadReceiver = async () => {
    if (!userId) return;

    try {
      const res = await API.get(`/users/${userId}`);
      setReceiver(res.data || null);
    } catch {
      setReceiver(null);
    }
  };

  useEffect(() => {
    loadReceiver();
    loadMessages();

    const timer = setInterval(loadMessages, 3000);
    return () => clearInterval(timer);
  }, [userId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const compressImage = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      const img = new Image();

      reader.onload = () => {
        img.src = reader.result;
      };

      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxWidth = 700;
        const scale = Math.min(maxWidth / img.width, 1);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        resolve(canvas.toDataURL("image/jpeg", 0.55));
      };

      reader.onerror = reject;
      img.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const sendMessage = async (messageValue = null, type = "text") => {
    const value = String(messageValue ?? text ?? "");

    if (type === "text" && !value.trim()) return;
    if (type !== "text" && !value) return;

    try {
      setError("");

      await API.post("/chat/send", {
        receiver_id: Number(userId),
        message: value,
        type,
      });

      if (type === "text") setText("");

      await loadMessages();
    } catch (err) {
      console.error("send message error:", err);
      setError(err.response?.data?.message || t("chat.failedToSend"));
    }
  };

  const sendImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImage(file);
      await sendMessage(compressed, "image");
      e.target.value = "";
    } catch {
      setError(t("chat.failedToSendImage"));
    }
  };

  const sendLocation = () => {
    if (!navigator.geolocation) {
      setError(t("chat.locationNotSupported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        await sendMessage(url, "location");
      },
      () => {
        setError(t("chat.failedToGetLocation"));
      }
    );
  };

  const renderMessageContent = (msg) => {
    if (msg.type === "image" || String(msg.message || "").startsWith("data:image/")) {
      return (
        <img
          className="chat-message-image"
          src={msg.message}
          alt="sent"
        />
      );
    }

    if (
      msg.type === "location" ||
      String(msg.message || "").includes("google.com/maps")
    ) {
      return (
        <a href={msg.message} target="_blank" rel="noreferrer">
          {t("chat.openLocation")}
        </a>
      );
    }

    return msg.message;
  };

  return (
    <>
      <Header />

      <main className="chat-container">
        <div className="chat-header">
          Chat with {receiver?.name || "User"}
        </div>

        {error && <div className="auth-error">{error}</div>}

        <section className="chat-messages">
          {messages.length === 0 ? (
            <div className="notification-empty">{t("chat.noMessages")}</div>
          ) : (
            messages.map((msg, index) => {
              const mine = Number(msg.sender_id) === Number(currentUser.id);

              return (
                <div
                  key={msg.id || index}
                  className={`chat-message ${mine ? "my-message" : ""}`}
                >
                  {renderMessageContent(msg)}
                </div>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </section>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          hidden
          onChange={sendImage}
        />

        <div className="chat-tools">
          <button
            className="chat-tool-btn"
            type="button"
            onClick={() => fileRef.current?.click()}
          >
            {t("chat.image")}
          </button>

          <button
            className="chat-tool-btn"
            type="button"
            onClick={sendLocation}
          >
            {t("chat.location")}
          </button>
        </div>

        <div className="chat-input">
          <input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={t("chat.typePlaceholder")}
            onKeyDown={(e) => {
              if (e.key === "Enter") sendMessage();
            }}
          />

          <button className="primary" onClick={() => sendMessage()}>
            {t("chat.send")}
          </button>
        </div>
      </main>
    </>
  );
}

export default Chat;