import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Header from "../components/common/Header";
import { getChatMessages, sendChatMessage } from "../services/chatService";

function Chat() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  const loadMessages = useCallback(async () => {
    if (!userId) return;

    try {
      const data = await getChatMessages(userId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("load chat error:", err?.response?.data || err.message);
    }
  }, [userId]);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const showNotice = (msg) => {
    setNotice(msg);
    setTimeout(() => setNotice(""), 2500);
  };

  const handleSend = async (content = null, type = "text") => {
    const messageValue = String(content ?? text ?? "");

    if (!userId) {
      showNotice("Chat user is missing.");
      return;
    }

    if (type === "text" && !messageValue.trim()) return;
    if (type !== "text" && !messageValue) return;

    try {
      setSending(true);

      await sendChatMessage({
        receiver_id: Number(userId),
        message: messageValue,
        type,
      });

      if (type === "text") setText("");
      await loadMessages();
    } catch (err) {
      console.error("send chat error:", err?.response?.data || err.message);
      showNotice("Failed to send message.");
    } finally {
      setSending(false);
    }
  };

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

  const handleImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const image = await compressImage(file);
      await handleSend(image, "image");
      e.target.value = "";
    } catch {
      showNotice("Failed to send image.");
    }
  };

  const handleLocation = () => {
    if (!navigator.geolocation) {
      showNotice("Location is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        const url = `https://www.google.com/maps?q=${latitude},${longitude}`;
        await handleSend(url, "location");
      },
      () => showNotice("Failed to get location.")
    );
  };

  const renderMessage = (msg) => {
    if (msg.type === "image") {
      return <img src={msg.message} alt="sent" />;
    }

    if (msg.type === "location") {
      return (
        <a href={msg.message} target="_blank" rel="noreferrer">
          📍 Open Location
        </a>
      );
    }

    return msg.message;
  };

  return (
    <>
      <Header />

      <div className="chat-wrapper">
        <div className="chat-page-shell">
          <div className="chat-page-topbar">
            <button className="icon-btn" onClick={() => navigate("/chat")}>
              ← Back to Chats
            </button>
          </div>

          <div className="chat-shell">
            <div className="chat-header-bar">
              <div className="chat-avatar">💬</div>

              <div className="chat-title-block">
                <h3>Conversation</h3>
                <span>Messages update automatically</span>
              </div>
            </div>

            {notice ? <div className="mini-error">{notice}</div> : null}

            <div className="messages-container">
              {messages.length === 0 ? (
                <div className="empty-gallery-card">
                  <h3>No messages yet</h3>
                  <p>Start the conversation by sending the first message.</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const mine = Number(msg.sender_id) === Number(user.id);

                  return (
                    <div
                      key={msg.id || index}
                      className={`message-bubble ${
                        mine ? "my-message" : "other-message"
                      }`}
                    >
                      {renderMessage(msg)}
                    </div>
                  );
                })
              )}

              <div ref={bottomRef}></div>
            </div>

            <div className="chat-input-area">
              <label className="icon-btn">
                📷
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  style={{ display: "none" }}
                />
              </label>

              <button className="icon-btn" type="button" onClick={handleLocation}>
                📍
              </button>

              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Type a message..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleSend();
                }}
              />

              <button
                className="send-btn"
                type="button"
                disabled={sending}
                onClick={() => handleSend()}
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Chat;