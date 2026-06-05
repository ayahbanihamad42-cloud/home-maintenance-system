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
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";

import appStyles, { colors } from "../../styles/mobileStyles";
import API from "../../services/api";
import {
  getChatConversations,
  getMessages,
  sendMessage,
} from "../../services/chatService";

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
  const [aiImage, setAiImage] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);

  const scrollRef = useRef(null);

  const loadUser = async () => {
    const raw = await AsyncStorage.getItem("user");
    setUser(raw ? JSON.parse(raw) : {});
  };

  useEffect(() => {
    loadUser();
  }, []);

  const loadMessages = async (receiverIdParam) => {
    try {
      if (!receiverIdParam) return;

      const data = await getMessages(receiverIdParam);
      setMessages(Array.isArray(data) ? data : []);

      setTimeout(() => {
        scrollRef.current?.scrollToEnd?.({ animated: true });
      }, 120);
    } catch {
      setMessages([]);
      setChatError("Could not load messages.");
    }
  };

  const loadChatUsers = async () => {
    try {
      setChatError("");
      const data = await getChatConversations();
      setChatUsers(Array.isArray(data) ? data : []);
    } catch {
      setChatUsers([]);
      setChatError("Could not load conversations.");
    }
  };

  const openChatList = async () => {
    setChatOpen(false);
    setChatListOpen(true);
    await loadChatUsers();
  };

  useEffect(() => {
    global.openMobileChatCard = () => {
      openChatList();
    };

    global.openMobileAICard = () => {
      setAiOpen(true);
    };

    global.openMobileChatWith = async (person) => {
      if (!person?.id) {
        setChatError("Could not open this conversation.");
        setChatListOpen(true);
        return;
      }

      setReceiver({
        id: person.id,
        name: person.name || "Chat",
      });

      setChatListOpen(false);
      setChatOpen(true);
      await loadMessages(person.id);
    };

    return () => {
      global.openMobileChatCard = null;
      global.openMobileAICard = null;
      global.openMobileChatWith = null;
    };
  }, [user?.id]);

  useEffect(() => {
    if (!chatOpen || !receiver?.id) return;

    const timer = setInterval(() => {
      loadMessages(receiver.id);
    }, 3000);

    return () => clearInterval(timer);
  }, [chatOpen, receiver?.id]);

  const getReceiverId = (item) => {
    return (
      item.other_user_id ||
      item.userId ||
      item.user_id ||
      item.receiver_id ||
      item.sender_id ||
      item.id
    );
  };

  const getReceiverName = (item) => {
    return (
      item.other_user_name ||
      item.receiver_name ||
      item.sender_name ||
      item.name ||
      "Chat"
    );
  };

  const openChatWith = async (item) => {
    const id = getReceiverId(item);
    const name = getReceiverName(item);

    if (!id) {
      setChatError("Could not open this conversation.");
      return;
    }

    setReceiver({ id, name });
    setChatListOpen(false);
    setChatOpen(true);
    await loadMessages(id);
  };

  const sendText = async () => {
    try {
      if (!receiver?.id || !chatText.trim()) return;

      await sendMessage({
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

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setChatError("Please allow gallery access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.35,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset?.base64) {
        setChatError("Failed to read selected image.");
        return;
      }

      await sendMessage({
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

      await sendMessage({
        receiver_id: Number(receiver.id),
        message: url,
        type: "location",
      });

      await loadMessages(receiver.id);
    } catch (err) {
      setChatError(err.response?.data?.message || "Failed to send location.");
    }
  };

  const pickAIImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.35,
      base64: true,
    });

    if (!result.canceled) {
      const asset = result.assets?.[0];
      if (asset?.base64) {
        setAiImage(`data:image/jpeg;base64,${asset.base64}`);
      }
    }
  };

  const sendAI = async () => {
    try {
      if (!aiText.trim() && !aiImage) return;

      const text = aiText.trim();

      setAiMessages((prev) => [
        ...prev,
        { role: "user", text: text || "Analyze this image", image: aiImage },
      ]);

      setAiText("");
      setAiLoading(true);

      const res = await API.post("/ai/chat", {
        message: text || "Analyze this image",
        image: aiImage,
      });

      setAiMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          text:
            res.data?.reply ||
            res.data?.message ||
            res.data?.text ||
            "Done.",
          image: res.data?.url || res.data?.image || null,
        },
      ]);

      setAiImage(null);
    } catch {
      setAiMessages((prev) => [
        ...prev,
        { role: "assistant", text: "AI assistant failed." },
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
          <Image source={{ uri: content }} style={styles.messageImage} />
        ) : type === "location" ? (
          <Text
            style={[styles.messageText, mine && styles.mineText]}
            onPress={() => Linking.openURL(content)}
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
                  <Text style={styles.emptyText}>Messages will appear here.</Text>
                </View>
              ) : (
                chatUsers.map((item, index) => (
                  <TouchableOpacity
                    key={item.id || item.user_id || index}
                    style={styles.conversationItem}
                    onPress={() => openChatWith(item)}
                  >
                    <View style={styles.smallAvatar}>
                      <Text style={styles.smallAvatarText}>
                        {String(getReceiverName(item)).charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={styles.conversationName}>
                        {getReceiverName(item)}
                      </Text>
                      <Text style={styles.conversationLast} numberOfLines={1}>
                        {item.last_message ||
                          item.message ||
                          item.snippet ||
                          "Open conversation"}
                      </Text>
                    </View>
                  </TouchableOpacity>
                ))
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

                  {item.image ? (
                    <Image source={{ uri: item.image }} style={styles.messageImage} />
                  ) : null}
                </View>
              ))}

              {aiLoading ? (
                <View style={styles.messageBubble}>
                  <Text style={styles.messageText}>Thinking...</Text>
                </View>
              ) : null}
            </ScrollView>

            {aiImage ? (
              <View style={styles.previewBox}>
                <Image source={{ uri: aiImage }} style={styles.previewImage} />
                <TouchableOpacity onPress={() => setAiImage(null)}>
                  <Text style={styles.removeImage}>Remove</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.inputRow}>
              <TouchableOpacity style={styles.aiImageBtn} onPress={pickAIImage}>
                <Text style={styles.aiImageText}>📷</Text>
              </TouchableOpacity>

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
    elevation: 7,
  },
  floatText: { fontSize: 27 },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(31,22,51,0.38)",
    justifyContent: "flex-end",
  },
  bottomCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 18,
    height: "66%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
  },
  close: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    backgroundColor: "#FBFAFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
  },
  smallAvatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  smallAvatarText: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "900",
  },
  conversationName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  conversationLast: {
    color: colors.muted,
    fontSize: 15,
    marginTop: 4,
  },
  emptyCard: {
    backgroundColor: "#FBFAFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 18,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  emptyText: {
    color: colors.muted,
    marginTop: 6,
    fontWeight: "700",
  },
  messagesArea: {
    flex: 1,
    backgroundColor: "#FBFAFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 12,
  },
  messageBubble: {
    maxWidth: "82%",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  mineBubble: {
    alignSelf: "flex-end",
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  messageText: {
    color: colors.text,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "700",
  },
  mineText: { color: "#fff" },
  messageImage: {
    width: 190,
    height: 160,
    borderRadius: 16,
    marginTop: 8,
  },
  toolsRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 10,
  },
  toolBtn: {
    flex: 1,
    backgroundColor: colors.primarySoft,
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: "center",
  },
  toolText: {
    color: colors.primaryDark,
    fontWeight: "900",
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 10,
  },
  messageInput: {
    flex: 1,
    minHeight: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 15,
  },
  sendBtn: {
    minHeight: 54,
    borderRadius: 18,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  sendText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
  aiImageBtn: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  aiImageText: { fontSize: 22 },
  previewBox: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  previewImage: {
    width: 70,
    height: 70,
    borderRadius: 16,
  },
  removeImage: {
    color: "#D62828",
    fontWeight: "900",
  },
});

export default FloatingActions;