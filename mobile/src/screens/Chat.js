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
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import API from "../services/api";
import Header from "../components/Common/Header";

const API_HOST = "http://localhost:5000";

const fullUrl = (url) => {
  if (!url) return "";
  if (String(url).startsWith("http")) return url;
  if (String(url).startsWith("data:image")) return url;
  return `${API_HOST}${url}`;
};

export default function Chat({ navigation, route }) {
  const params = route?.params || {};
  const receiverId =
    params.receiverId || params.userId || params.user?.id || params.otherUserId;
  const receiverName = params.name || params.user?.name || "Conversation";

  const [currentUser, setCurrentUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [notice, setNotice] = useState("");
  const scrollRef = useRef(null);

  const loadCurrentUser = async () => {
    const saved = await AsyncStorage.getItem("user");
    setCurrentUser(saved ? JSON.parse(saved) : null);
  };

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
    loadCurrentUser();
  }, []);

  useEffect(() => {
    loadMessages();
    const timer = setInterval(loadMessages, 4000);
    return () => clearInterval(timer);
  }, [receiverId]);

  const isMine = (msg) => {
    const myId = currentUser?.id || currentUser?.user_id;

    if (msg.isMine || msg.is_mine || msg.mine) return true;

    return Number(msg.sender_id) === Number(myId);
  };

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
      setNotice(err.response?.data?.message || "Failed to send message.");
    }
  };

  const sendLocation = async () => {
    try {
      if (!receiverId) return;

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert("Notice", "Location permission is required.");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      const url = `https://www.google.com/maps?q=${loc.coords.latitude},${loc.coords.longitude}`;

      await API.post("/chat", {
        receiver_id: receiverId,
        message: url,
        type: "location",
      });

      loadMessages();
    } catch (err) {
      setNotice("Failed to send location.");
    }
  };

  const sendImage = async () => {
    try {
      if (!receiverId) return;

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Notice", "Image permission is required.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.45,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.base64) return;

      const mimeType = asset.mimeType || "image/jpeg";
      const image = `data:${mimeType};base64,${asset.base64}`;

      await API.post("/chat", {
        receiver_id: receiverId,
        message: image,
        type: "image",
      });

      loadMessages();
    } catch (err) {
      setNotice("Failed to send image.");
    }
  };

  const renderMessage = (msg, mine) => {
    const type = msg.type || "text";
    const content = msg.message || "";

    if (
      type === "image" ||
      String(content).startsWith("/images/chat/") ||
      String(content).startsWith("data:image")
    ) {
      return <Image source={{ uri: fullUrl(content) }} style={styles.msgImage} />;
    }

    if (type === "location" || String(content).includes("google.com/maps")) {
      return (
        <TouchableOpacity onPress={() => Linking.openURL(content)}>
          <Text style={[styles.locationText, mine && { color: "#fff" }]}>
            📍 Open Location
          </Text>
        </TouchableOpacity>
      );
    }

    return (
      <Text style={[styles.messageText, mine && styles.myMessageText]}>
        {content}
      </Text>
    );
  };

  return (
    <View style={styles.screen}>
      <Header />

      <View style={styles.wrapper}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate("ChatList")}
        >
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
            {messages.map((msg, index) => {
              const mine = isMine(msg);

              return (
                <View
                  key={msg.id || index}
                  style={[
                    styles.bubble,
                    mine ? styles.myBubble : styles.otherBubble,
                  ]}
                >
                  {renderMessage(msg, mine)}
                </View>
              );
            })}
          </ScrollView>

          <View style={styles.inputArea}>
            <TouchableOpacity style={styles.smallBtn} onPress={sendImage}>
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

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e7dccc" },
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
  myMessageText: { color: "#fff" },
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