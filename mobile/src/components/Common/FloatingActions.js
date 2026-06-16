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
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

import appStyles, { colors } from "../../styles/mobileStyles";
import API from "../../services/api";
import {
  getChatConversations,
  getMessages,
  sendMessage,
} from "../../services/chatService";

function FloatingActions({ navigation }) {
  const { t } = useTranslation();
  const { c } = useTheme();

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
      text: t("aiChat.greeting"),
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
      setChatError(t("chat.errorLoadMessages"));
    }
  };

  const loadChatUsers = async () => {
    try {
      setChatError("");
      const data = await getChatConversations();
      setChatUsers(Array.isArray(data) ? data : []);
    } catch {
      setChatUsers([]);
      setChatError(t("chat.errorLoadConversations"));
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
        setChatError(t("chat.errorOpenConversation"));
        setChatListOpen(true);
        return;
      }

      setReceiver({
        id: person.id,
        name: person.name || t("nav.chat"),
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
      t("nav.chat")
    );
  };

  const openChatWith = async (item) => {
    const id = getReceiverId(item);
    const name = getReceiverName(item);

    if (!id) {
      setChatError(t("chat.errorOpenConversation"));
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
      setChatError(err.response?.data?.message || t("chat.errorSendMessage"));
    }
  };

  const sendImage = async () => {
    try {
      if (!receiver?.id) return;

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setChatError(t("chat.errorGalleryAccess"));
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
        setChatError(t("chat.errorReadImage"));
        return;
      }

      await sendMessage({
        receiver_id: Number(receiver.id),
        message: `data:image/jpeg;base64,${asset.base64}`,
        type: "image",
      });

      await loadMessages(receiver.id);
    } catch (err) {
      setChatError(err.response?.data?.message || t("chat.errorSendImage"));
    }
  };

  const sendLocation = async () => {
    try {
      if (!receiver?.id) return;

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setChatError(t("chat.errorLocationAccess"));
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
      setChatError(err.response?.data?.message || t("chat.errorSendLocation"));
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
        { role: "assistant", text: t("aiChat.error") },
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
        style={[
          styles.messageBubble,
          { backgroundColor: c.card, borderColor: c.border },
          mine && { alignSelf: "flex-end", backgroundColor: c.primary, borderColor: c.primary },
        ]}
      >
        {type === "image" ? (
          <Image source={{ uri: content }} style={styles.messageImage} />
        ) : type === "location" ? (
          <Text
            style={[styles.messageText, { color: c.text }, mine && { color: "#fff" }]}
            onPress={() => Linking.openURL(content)}
          >
            {t("chat.openSharedLocation")}
          </Text>
        ) : (
          <Text style={[styles.messageText, { color: c.text }, mine && { color: "#fff" }]}>
            {content}
          </Text>
        )}
      </View>
    );
  };

  return (
    <>
      <View pointerEvents="box-none" style={styles.floatingWrap}>
        <TouchableOpacity style={[styles.floatBtn, { backgroundColor: c.primary }]} onPress={openChatList}>
          <Text style={styles.floatText}>{"💬"}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.floatBtn, { backgroundColor: c.primary }]} onPress={() => setAiOpen(true)}>
          <Text style={styles.floatText}>{"✨"}</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={chatListOpen} animationType="slide">
        <View style={[styles.overlay, { backgroundColor: c.overlay }]}>
          <View style={[styles.bottomCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: c.text }]}>{t("nav.chat")}</Text>
              <TouchableOpacity onPress={() => setChatListOpen(false)}>
                <Text style={[styles.close, { color: c.text }]}>{"✕"}</Text>
              </TouchableOpacity>
            </View>

            {chatError ? (
              <View style={appStyles.errorBox}>
                <Text style={appStyles.errorText}>{chatError}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false}>
              {chatUsers.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: c.bg, borderColor: c.border }]}>
                  <Text style={[styles.emptyTitle, { color: c.text }]}>{t("chat.noConversations")}</Text>
                  <Text style={[styles.emptyText, { color: c.muted }]}>{t("chatList.noConversationsMsg")}</Text>
                </View>
              ) : (
                chatUsers.map((item, index) => (
                  <TouchableOpacity
                    key={item.id || item.user_id || index}
                    style={[styles.conversationItem, { backgroundColor: c.bg, borderColor: c.border }]}
                    onPress={() => openChatWith(item)}
                  >
                    <View style={[styles.smallAvatar, { backgroundColor: c.primarySoft }]}>
                      <Text style={[styles.smallAvatarText, { color: c.primary }]}>
                        {String(getReceiverName(item)).charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text style={[styles.conversationName, { color: c.text }]}>
                        {getReceiverName(item)}
                      </Text>
                      <Text style={[styles.conversationLast, { color: c.muted }]} numberOfLines={1}>
                        {item.last_message ||
                          item.message ||
                          item.snippet ||
                          t("chat.openConversation")}
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
          style={[styles.overlay, { backgroundColor: c.overlay }]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.bottomCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: c.text }]}>{receiver?.name || t("nav.chat")}</Text>
              <TouchableOpacity onPress={() => setChatOpen(false)}>
                <Text style={[styles.close, { color: c.text }]}>{"✕"}</Text>
              </TouchableOpacity>
            </View>

            {chatError ? (
              <View style={appStyles.errorBox}>
                <Text style={appStyles.errorText}>{chatError}</Text>
              </View>
            ) : null}

            <ScrollView
              ref={scrollRef}
              style={[styles.messagesArea, { backgroundColor: c.bg, borderColor: c.border }]}
              showsVerticalScrollIndicator={false}
            >
              {messages.length === 0 ? (
                <View style={[styles.emptyCard, { backgroundColor: c.bg, borderColor: c.border }]}>
                  <Text style={[styles.emptyTitle, { color: c.text }]}>{t("chat.noMessages")}</Text>
                  <Text style={[styles.emptyText, { color: c.muted }]}>{t("chat.startConversation")}</Text>
                </View>
              ) : (
                messages.map(renderMessage)
              )}
            </ScrollView>

            <View style={styles.toolsRow}>
              <TouchableOpacity style={[styles.toolBtn, { backgroundColor: c.primarySoft }]} onPress={sendImage}>
                <Text style={[styles.toolText, { color: c.primaryDark }]}>{t("chat.image")}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.toolBtn, { backgroundColor: c.primarySoft }]} onPress={sendLocation}>
                <Text style={[styles.toolText, { color: c.primaryDark }]}>{t("chat.location")}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputRow}>
              <TextInput
                style={[styles.messageInput, { borderColor: c.border, color: c.text, backgroundColor: c.inputBg }]}
                value={chatText}
                onChangeText={setChatText}
                placeholder={t("chat.typePlaceholder")}
                placeholderTextColor={c.muted}
              />

              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: c.primary }]} onPress={sendText}>
                <Text style={styles.sendText}>{t("chat.send")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      <Modal transparent visible={aiOpen} animationType="slide">
        <KeyboardAvoidingView
          style={[styles.overlay, { backgroundColor: c.overlay }]}
          behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
          <View style={[styles.bottomCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <View style={styles.cardHeader}>
              <Text style={[styles.cardTitle, { color: c.text }]}>{t("nav.aiAssistant")}</Text>
              <TouchableOpacity onPress={() => setAiOpen(false)}>
                <Text style={[styles.close, { color: c.text }]}>{"✕"}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={[styles.messagesArea, { backgroundColor: c.bg, borderColor: c.border }]}>
              {aiMessages.map((item, index) => (
                <View
                  key={index}
                  style={[
                    styles.messageBubble,
                    { backgroundColor: c.card, borderColor: c.border },
                    item.role === "user" && { alignSelf: "flex-end", backgroundColor: c.primary, borderColor: c.primary },
                  ]}
                >
                  <Text
                    style={[
                      styles.messageText,
                      { color: c.text },
                      item.role === "user" && { color: "#fff" },
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
                <View style={[styles.messageBubble, { backgroundColor: c.card, borderColor: c.border }]}>
                  <Text style={[styles.messageText, { color: c.text }]}>{t("aiChat.thinking")}</Text>
                </View>
              ) : null}
            </ScrollView>

            {aiImage ? (
              <View style={styles.previewBox}>
                <Image source={{ uri: aiImage }} style={styles.previewImage} />
                <TouchableOpacity onPress={() => setAiImage(null)}>
                  <Text style={styles.removeImage}>{t("aiChat.remove")}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <View style={styles.inputRow}>
              <TouchableOpacity style={[styles.aiImageBtn, { backgroundColor: c.primarySoft }]} onPress={pickAIImage}>
                <Text style={styles.aiImageText}>{"📷"}</Text>
              </TouchableOpacity>

              <TextInput
                style={[styles.messageInput, { borderColor: c.border, color: c.text, backgroundColor: c.inputBg }]}
                value={aiText}
                onChangeText={setAiText}
                placeholder={t("aiChat.askPlaceholder")}
                placeholderTextColor={c.muted}
              />

              <TouchableOpacity style={[styles.sendBtn, { backgroundColor: c.primary }]} onPress={sendAI}>
                <Text style={styles.sendText}>{t("chat.send")}</Text>
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
    justifyContent: "center",
    alignItems: "center",
    elevation: 7,
  },
  floatText: { fontSize: 27 },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  bottomCard: {
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 18,
    height: "66%",
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 30,
    fontWeight: "900",
  },
  close: {
    fontSize: 34,
    fontWeight: "900",
  },
  conversationItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderRadius: 22,
    padding: 14,
    marginBottom: 12,
  },
  smallAvatar: {
    width: 56,
    height: 56,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  smallAvatarText: {
    fontSize: 22,
    fontWeight: "900",
  },
  conversationName: {
    fontSize: 17,
    fontWeight: "900",
  },
  conversationLast: {
    fontSize: 15,
    marginTop: 4,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 22,
    padding: 18,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: "900",
  },
  emptyText: {
    marginTop: 6,
    fontWeight: "700",
  },
  messagesArea: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 22,
    padding: 12,
  },
  messageBubble: {
    maxWidth: "82%",
    borderWidth: 1,
    borderRadius: 18,
    padding: 12,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "700",
  },
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
    borderRadius: 16,
    paddingVertical: 11,
    alignItems: "center",
  },
  toolText: {
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
    paddingHorizontal: 14,
    fontSize: 15,
  },
  sendBtn: {
    minHeight: 54,
    borderRadius: 18,
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
