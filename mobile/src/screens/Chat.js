import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
} from "react-native";
import API from "../services/api";

const API_HOST = "http://localhost:5000";

const fullUrl = (url) => {
  if (!url) return "";
  if (String(url).startsWith("http")) return url;
  return `${API_HOST}${url}`;
};

export default function Chat({ navigation, route }) {
  const params = route?.params || {};
  const receiverId =
    params.receiverId || params.userId || params.user?.id || params.otherUserId;
  const receiverName = params.name || params.user?.name || "Conversation";

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");
  const scrollRef = useRef(null);

  const loadMessages = async () => {
    try {
      if (!receiverId) {
        setNotice("Receiver id is missing.");
        return;
      }

      const res = await API.get(`/chat/${receiverId}`);
      setMessages(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("chat load error:", err.response?.data || err.message);
      setNotice(err.response?.data?.message || "Failed to load messages.");
    }
  };

  useEffect(() => {
    loadMessages();
    const timer = setInterval(loadMessages, 4000);
    return () => clearInterval(timer);
  }, [receiverId]);

  const sendText = async () => {
    try {
      if (!text.trim() || !receiverId) return;

      await API.post("/chat", {
        receiver_id: receiverId,
        message: text.trim(),
        type: "text",
      });

      setText("");
      loadMessages();
    } catch (err) {
      console.log("send error:", err.response?.data || err.message);
      setNotice(err.response?.data?.message || "Failed to send message.");
    }
  };

  const sendLocation = async () => {
    try {
      if (!receiverId) return;

      const fakeLocation = "https://www.google.com/maps?q=32.5317,35.8676";

      await API.post("/chat", {
        receiver_id: receiverId,
        message: fakeLocation,
        type: "location",
      });

      loadMessages();
    } catch (err) {
      console.log("location error:", err.response?.data || err.message);
      setNotice("Failed to send location.");
    }
  };

  const isMine = (msg) => {
    return msg.isMine || msg.is_mine || msg.mine;
  };

  const renderMessage = (msg) => {
    const type = msg.type || "text";
    const content = msg.message || "";

    if (type === "image" || String(content).startsWith("/images/chat/")) {
      return <Image source={{ uri: fullUrl(content) }} style={styles.msgImage} />;
    }

    if (type === "location" || String(content).includes("google.com/maps")) {
      return (
        <TouchableOpacity onPress={() => Linking.openURL(content)}>
          <Text style={styles.locationText}>📍 Open Location</Text>
        </TouchableOpacity>
      );
    }

    return <Text style={styles.messageText}>{content}</Text>;
  };

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <View style={styles.wrapper}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.navigate("ChatList")}>
          <Text style={styles.backText}>← Back to Chats</Text>
        </TouchableOpacity>

        <View style={styles.chatShell}>
          <View style={styles.chatHeader}>
            <View style={styles.chatIcon}>
              <Text style={styles.chatIconText}>💬</Text>
            </View>
            <View>
              <Text style={styles.chatTitle}>{receiverName}</Text>
              <Text style={styles.chatSub}>Messages update automatically</Text>
            </View>
          </View>

          {notice ? <Text style={styles.notice}>{notice}</Text> : null}

          <ScrollView
            ref={scrollRef}
            style={styles.messages}
            contentContainerStyle={styles.messagesContent}
            onContentSizeChange={() =>
              scrollRef.current?.scrollToEnd({ animated: true })
            }
          >
            {messages.map((msg, index) => (
              <View
                key={msg.id || index}
                style={[
                  styles.bubble,
                  isMine(msg) ? styles.myBubble : styles.otherBubble,
                ]}
              >
                {renderMessage(msg)}
              </View>
            ))}
          </ScrollView>

          <View style={styles.inputArea}>
            <TouchableOpacity style={styles.smallBtn}>
              <Text style={styles.smallBtnText}>📷</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallBtn} onPress={sendLocation}>
              <Text style={styles.smallBtnText}>📍</Text>
            </TouchableOpacity>

            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
            />

            <TouchableOpacity style={styles.sendBtn} onPress={sendText}>
              <Text style={styles.sendText}>Send</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );
}

function Header({ navigation }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Maintenance System</Text>
      <TouchableOpacity style={styles.bell}>
        <Text style={styles.bellText}>🔔</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e7dccc" },
  header: {
    minHeight: 96,
    backgroundColor: "#faf5ef",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#d8c8b8",
  },
  headerTitle: { flex: 1, fontSize: 26, fontWeight: "900" },
  bell: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bellText: { fontSize: 26 },
  logout: {
    backgroundColor: "#111",
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 28,
  },
  logoutText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  wrapper: { flex: 1, padding: 18 },
  backBtn: {
    alignSelf: "flex-start",
    backgroundColor: "#fffaf4",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#d8c8b8",
    marginBottom: 10,
  },
  backText: { fontWeight: "800", color: "#111" },
  chatShell: {
    flex: 1,
    backgroundColor: "#fffaf4",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  chatHeader: {
    backgroundColor: "#111",
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  chatIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fffaf4",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  chatIconText: { fontSize: 24 },
  chatTitle: { color: "#fff", fontSize: 22, fontWeight: "900" },
  chatSub: { color: "#ddd", fontSize: 13 },
  notice: {
    backgroundColor: "#fdebed",
    color: "#b4232b",
    padding: 12,
    fontSize: 15,
  },
  messages: { flex: 1 },
  messagesContent: { padding: 14 },
  bubble: {
    maxWidth: "78%",
    padding: 13,
    borderRadius: 18,
    marginBottom: 10,
  },
  myBubble: {
    alignSelf: "flex-end",
    backgroundColor: "#111",
    borderBottomRightRadius: 4,
  },
  otherBubble: {
    alignSelf: "flex-start",
    backgroundColor: "#f7efe7",
    borderWidth: 1,
    borderColor: "#d8c8b8",
    borderBottomLeftRadius: 4,
  },
  messageText: { fontSize: 16, color: "#111" },
  locationText: { fontSize: 16, fontWeight: "900", color: "#0b57d0" },
  msgImage: {
    width: 230,
    height: 170,
    borderRadius: 14,
    resizeMode: "cover",
  },
  inputArea: {
    flexDirection: "row",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#d8c8b8",
    alignItems: "center",
    gap: 8,
  },
  smallBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#f7efe7",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  smallBtnText: { fontSize: 18 },
  input: {
    flex: 1,
    height: 46,
    backgroundColor: "#f7efe7",
    borderWidth: 1,
    borderColor: "#d8c8b8",
    borderRadius: 20,
    paddingHorizontal: 14,
    fontSize: 15,
  },
  sendBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 20,
    height: 46,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendText: { color: "#fff", fontWeight: "900" },
});