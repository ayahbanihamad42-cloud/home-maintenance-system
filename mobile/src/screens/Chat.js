import React, { useEffect, useState, useContext, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking,
} from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";

import Header from "../components/Common/Header";
import { AuthContext } from "../context/AuthContext";
import { sendChatMessage, getChatMessages } from "../services/chatService";
import appStyles from "../styles/mobileStyles";

function Chat() {
  const route = useRoute();
  const navigation = useNavigation();
  const { userId } = route.params;
  const { user } = useContext(AuthContext);

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [chatMessage, setChatMessage] = useState(null);
  const scrollViewRef = useRef(null);

  const showMessage = (type, title, body) => {
    setChatMessage({ type, title, body });
    setTimeout(() => setChatMessage(null), 2500);
  };

  const loadMessages = () => {
    getChatMessages(userId)
      .then((data) => setMessages(data || []))
      .catch(() => {
        setMessages([]);
        showMessage("error", "Notice", "Failed to load chat messages.");
      });
  };

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000);
    return () => clearInterval(interval);
  }, [userId]);

  const handleSend = async (content = null, type = "text") => {
    const messageValue = content || text;
    if (!messageValue.trim() && type === "text") return;

    const pending = {
      sender_id: user?.id,
      receiver_id: Number(userId),
      message: messageValue,
      type,
    };

    setMessages((prev) => [...prev, pending]);
    if (type === "text") setText("");

    try {
      await sendChatMessage({
        receiver_id: Number(userId),
        message: messageValue,
        type,
      });
    } catch (e) {
      showMessage("error", "Notice", "Failed to send message.");
    }

    loadMessages();
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      handleSend(`data:image/jpeg;base64,${result.assets[0].base64}`, "image");
    }
  };

  const shareLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      showMessage("warning", "Notice", "Unable to access location.");
      return;
    }

    const location = await Location.getCurrentPositionAsync({});
    const locString = `https://www.google.com/maps?q=${location.coords.latitude},${location.coords.longitude}`;
    handleSend(locString, "location");
  };

  return (
    <SafeAreaView style={appStyles.screen}>
      <Header />

      <View style={appStyles.chatTopBar}>
        <TouchableOpacity
          style={appStyles.backBtn}
          onPress={() => navigation.navigate("ChatList")}
        >
          <Text style={appStyles.backBtnText}>Back to Chats</Text>
        </TouchableOpacity>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={{ flex: 1 }}
        keyboardVerticalOffset={90}
      >
        <View style={appStyles.chatHeaderBar}>
          <View style={appStyles.chatAvatar}>
            <Text>💬</Text>
          </View>
          <View style={appStyles.chatTitleBlock}>
            <Text style={appStyles.chatTitle}>Conversation</Text>
            <Text style={appStyles.chatStatus}>
              Messages update automatically
            </Text>
          </View>
        </View>

        {chatMessage ? (
          <View
            style={[
              appStyles.messageCard,
              appStyles[`${chatMessage.type}Card`],
              { marginHorizontal: 16, marginTop: 12 },
            ]}
          >
            <Text style={appStyles.messageTitle}>{chatMessage.title}</Text>
            <Text style={appStyles.messageBody}>{chatMessage.body}</Text>
          </View>
        ) : null}

        <ScrollView
          style={appStyles.messagesContainer}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.length === 0 ? (
            <View style={appStyles.messageCard}>
              <Text style={appStyles.messageTitle}>No messages yet</Text>
              <Text style={appStyles.messageBody}>
                Start the conversation by sending the first message.
              </Text>
            </View>
          ) : (
            messages.map((m, i) => (
              <View
                key={i}
                style={[
                  appStyles.messageBubble,
                  m.sender_id === user?.id
                    ? appStyles.myMessage
                    : appStyles.otherMessage,
                ]}
              >
                {m.type === "image" ? (
                  <Image source={{ uri: m.message }} style={appStyles.sentImage} />
                ) : m.type === "location" ? (
                  <TouchableOpacity onPress={() => Linking.openURL(m.message)}>
                    <Text style={appStyles.locationText}>📍 View My Location</Text>
                  </TouchableOpacity>
                ) : (
                  <Text
                    style={[
                      appStyles.messageText,
                      m.sender_id === user?.id
                        ? appStyles.myText
                        : appStyles.otherText,
                    ]}
                  >
                    {m.message}
                  </Text>
                )}
              </View>
            ))
          )}
        </ScrollView>

        <View style={appStyles.chatInputArea}>
          <TouchableOpacity style={appStyles.iconBtn} onPress={pickImage}>
            <Text style={appStyles.iconBtnText}>📷</Text>
          </TouchableOpacity>

          <TouchableOpacity style={appStyles.iconBtn} onPress={shareLocation}>
            <Text style={appStyles.iconBtnText}>📍</Text>
          </TouchableOpacity>

          <TextInput
            style={appStyles.chatInput}
            placeholder="Type a message..."
            value={text}
            onChangeText={setText}
          />

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={() => handleSend()}
          >
            <Text style={appStyles.primaryBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export default Chat;