import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  ScrollView,
  Image,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appStyles, { colors } from "../../styles/mobileStyles";
import {
  getChatMessages,
  sendChatMessage,
} from "../../services/chatService";
import API from "../../services/api";

function FloatingActions({ navigation }) {
  const [chatOpen, setChatOpen] = useState(false);
  const [aiOpen, setAiOpen] = useState(false);
  const [chatListOpen, setChatListOpen] = useState(false);

  const [user, setUser] = useState({});
  const [chatUsers, setChatUsers] = useState([]);
  const [receiver, setReceiver] = useState(null);

  const [messages, setMessages] = useState([]);
  const [chatText, setChatText] = useState("");
  const [chatError, setChatError] = useState("");

  const [aiMessages, setAiMessages] = useState([
    {
      role: "assistant",
      text: "Hi! How can I help you with home maintenance today?",
    },
  ]);
  const [aiText, setAiText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  const scrollRef = useRef(null);

  const loadUser = async () => {
    const raw = await AsyncStorage.getItem("user");
    setUser(raw ? JSON.parse(raw) : {});
  };

  useEffect(() => {
    loadUser();
  }, []);

  const loadChatUsers = async () => {
    try {
      setChatError("");

      const res = await API.get("/chat/conversations");
      const list = Array.isArray(res.data) ? res.data : [];

      setChatUsers(list);
    } catch {
      try {
        const res = await API.get("/users");
        const list = Array.isArray(res.data) ? res.data : [];
        setChatUsers(list.filter((item) => Number(item.id) !== Number(user.id)));
      } catch {
        setChatUsers([]);
      }
    }
  };

  const openChatList = async () => {
    setChatListOpen(true);
    await loadChatUsers();
  };

  const openChatWith = async (item) => {
    const receiverId =
      item.receiver_id ||
      item.sender_id ||
      item.user_id ||
      item.id ||
      item.other_user_id;

    const receiverName =
      item.receiver_name ||
      item.sender_name ||
      item.name ||
      item.other_user_name ||
      "Chat";

    if (!receiverId) {
      setChatError("Could not open this conversation.");
      return;
    }

    const selected = {
      id: receiverId,
      name: receiverName,
    };

    setReceiver(selected);
    setChatListOpen(false);
    setChatOpen(true);
    await loadMessages(selected.id);
  };

  const loadMessages = async (receiverIdParam = receiver?.id) => {
    try {
      if (!receiverIdParam) return;

      const data = await getChatMessages(receiverIdParam);
      setMessages(Array.isArray(data) ? data : []);

      setTimeout(() => {
        scrollRef.current?.scrollToEnd?.({ animated: true });
      }, 100);
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    if (!chatOpen || !receiver?.id) return;

    loadMessages(receiver.id);

    const timer = setInterval(() => {
      loadMessages(receiver.id);
    }, 3000);

    return () => clearInterval(timer);
  }, [chatOpen, receiver?.id]);

  const sendText = async () => {
    try {
      if (!receiver?.id || !chatText.trim()) return;

      await sendChatMessage({
        receiver_id: Number(receiver.id),
        message: chatText.trim(),
        type: "text",
      });

      setChatText("");
      await loadMessages(receiver.id);
    } catch (err) {
      setChatError(err.response?.data?.message || "Failed to send message.");
    }
  };

  const sendImage = async () => {
    try {
      if (!receiver?.id) return;

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setChatError("Please allow gallery access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.45,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset?.base64) {
        setChatError("Failed to read selected image.");
        return;
      }

      await sendChatMessage({
        receiver_id: Number(receiver.id),
        message: `data:image/jpeg;base64,${asset.base64}`,
        type: "image",
      });

      await loadMessages(receiver.id);
    } catch (err) {
      setChatError(err.response?.data?.message || "Failed to send image.");
    }
  };

  const sendLocation = async () => {
    try {
      if (!receiver?.id) return;

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setChatError("Please allow location access.");
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const url = `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`;

      await sendChatMessage({
        receiver_id: Number(receiver.id),
        message: url,
        type: "location",
      });

      await loadMessages(receiver.id);
    } catch (err) {
      setChatError(err.response?.data?.message || "Failed to send location.");
    }
  };

  const sendAI = async () => {
    try {
      if (!aiText.trim()) return;

      const userMessage = aiText.trim();

      setAiMessages((prev) => [...prev, { role: "user", text: userMessage }]);
      setAiText("");
      setAiLoading(true);

      const res = await API.post("/ai/chat", {
        message: userMessage,
      });

      const reply =
        res.data?.reply ||
        res.data?.message ||
        res.data?.text ||
        "I could not generate a response right now.";

      setAiMessages((prev) => [...prev, { role: "assistant", text: reply }]);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text: "AI assistant is currently unavailable. Please try again later.",
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  const renderMessage = (item, index) => {
    const mine = Number(item.sender_id) === Number(user.id);
    const type = item.type || item.message_type || "text";
    const content = item.message || item.text || "";

    return (
      <View
        key={item.id || index}
        style={[styles.messageBubble, mine && styles.mineBubble]}
      >
        {type === "image" ? (
          <Image
            source={{ uri: content }}
            style={styles.messageImage}
            resizeMode="cover"
          />
        ) : type === "location" ? (
          <Text
            style={[styles.messageText, mine && styles.mineText]}
            onPress={() => {
              try {
                navigation?.navigate?.("Home");
              } catch {}
            }}
          >
            📍 Open Location
          </Text>
        ) : (
          <Text style={[styles.messageText, mine && styles.mineText]}>
            {content}
          </Text>
        )}
      </View>
    );
  };

  return (
    <>
      <View pointerEvents="box-none" style={styles.floatingWrap}>
        <TouchableOpacity style={styles.floatBtn} onPress={openChatList}>
          <Text style={styles.floatText}>💬</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.floatBtn} onPress={() => setAiOpen(true)}>
          <Text style={styles.floatText}>✨</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={chatListOpen} animationType="slide">
        <View style={styles.overlay}>
          <View style={styles.bottomCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>Chat</Text>
              <TouchableOpacity onPress={() => setChatListOpen(false)}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            {chatError ? (
              <View style={appStyles.errorBox}>
                <Text style={appStyles.errorText}>{chatError}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false}>
              {chatUsers.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No conversations</Text>
                  <Text style={styles.emptyText}>
                    Messages will appear here.
                  </Text>
                </View>
              ) : (
                chatUsers.map((item, index) => {
                  const name =
                    item.receiver_name ||
                    item.sender_name ||
                    item.other_user_name ||
                    item.name ||
                    "User";

                  const last =
                    item.last_message ||
                    item.message ||
                    item.snippet ||
                    "Open conversation";

                  return (
                    <TouchableOpacity
                      key={item.id || item.user_id || index}
                      style={styles.conversationItem}
                      onPress={() => openChatWith(item)}
                    >
                      <View style={styles.smallAvatar}>
                        <Text style={styles.smallAvatarText}>
                          {String(name).charAt(0).toUpperCase()}
                        </Text>
                      </View>

                      <View style={{ flex: 1 }}>
                        <Text style={styles.conversationName}>{name}</Text>
                        <Text style={styles.conversationLast} numberOfLines={1}>
                          {last}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={chatOpen} animationType="slide">
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.bottomCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{receiver?.name || "Chat"}</Text>
              <TouchableOpacity onPress={() => setChatOpen(false)}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            {chatError ? (
              <View style={appStyles.errorBox}>
                <Text style={appStyles.errorText}>{chatError}</Text>
              </View>
            ) : null}

            <ScrollView
              ref={scrollRef}
              style={styles.messagesArea}
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 ? (
                <View style={styles.emptyCard}>
                  <Text style={styles.emptyTitle}>No messages yet</Text>
                  <Text style={styles.emptyText}>Start the conversation.</Text>
                </View>
              ) : (
                messages.map(renderMessage)
              )}
            </ScrollView>

            <View style={styles.toolsRow}>
              <TouchableOpacity style={styles.toolBtn} onPress={sendImage}>
                <Text style={styles.toolText}>📷 Image</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.toolBtn} onPress={sendLocation}>
                <Text style={styles.toolText}>📍 Location</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.messageInput}
                value={chatText}
                onChangeText={setChatText}
                placeholder="Type a message..."
              />

              <TouchableOpacity style={styles.sendBtn} onPress={sendText}>
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal transparent visible={aiOpen} animationType="slide">
        <KeyboardAvoidingView
          style={styles.overlay}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={styles.bottomCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>AI Assistant</Text>
              <TouchableOpacity onPress={() => setAiOpen(false)}>
                <Text style={styles.close}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.messagesArea}>
              {aiMessages.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    item.role === "user" && styles.mineBubble,
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      item.role === "user" && styles.mineText,
                    ]}
                  >
                    {item.text}
                  </Text>
                </View>
              ))}

              {aiLoading ? (
                <View style={styles.messageBubble}>
                  <Text style={styles.messageText}>Thinking...</Text>
                </View>
              ) : null}
            </ScrollView>

            <View style={styles.inputRow}>
              <TextInput
                style={styles.messageInput}
                value={aiText}
                onChangeText={setAiText}
                placeholder="Ask AI..."
              />

              <TouchableOpacity style={styles.sendBtn} onPress={sendAI}>
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  floatingWrap: {
    position: "absolute",
    right: 18,
    bottom: 24,
    zIndex: 100,
    gap: 14,
  },

  floatBtn: {
    width: 66,
    height: 66,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 7,
  },

  floatText: {
    fontSize: 27,
  },

  overlay: {
    flex: 1,
    backgroundColor: "rgba(31,22,51,0.38)",
    justifyContent: "flex-end",
  },

  bottomCard: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    maxHeight: "82%",
    minHeight: "58%",
  },

  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },

  cardTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
  },

  close: {
    fontSize: 28,
    fontWeight: "900",
    color: colors.text,
  },

  messagesArea: {
    flex: 1,
    backgroundColor: "#FBFAFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 12,
    marginBottom: 12,
  },

  messageBubble: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    maxWidth: "85%",
    alignSelf: "flex-start",
  },

  mineBubble: {
    backgroundColor: colors.primary,
    alignSelf: "flex-end",
  },

  messageText: {
    color: colors.text,
    fontSize: 16,
    lineHeight: 23,
  },

  mineText: {
    color: "#FFFFFF",
  },

  messageImage: {
    width: 210,
    height: 160,
    borderRadius: 16,
  },

  toolsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },

  toolBtn: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingVertical: 12,
    alignItems: "center",
  },

  toolText: {
    color: colors.primaryDark,
    fontWeight: "900",
  },

  inputRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },

  messageInput: {
    flex: 1,
    minHeight: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    paddingHorizontal: 14,
    fontSize: 16,
    color: colors.text,
  },

  sendBtn: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    minHeight: 52,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  sendText: {
    color: "#FFFFFF",
    fontWeight: "900",
  },

  emptyCard: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 18,
    backgroundColor: "#FFFFFF",
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: colors.text,
  },

  emptyText: {
    fontSize: 15,
    color: colors.muted,
    marginTop: 6,
  },

  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#FBFAFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
  },

  smallAvatar: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },

  smallAvatarText: {
    color: colors.primaryDark,
    fontWeight: "900",
    fontSize: 18,
  },

  conversationName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },

  conversationLast: {
    color: colors.muted,
    fontSize: 14,
    marginTop: 3,
  },
});

export default FloatingActions;