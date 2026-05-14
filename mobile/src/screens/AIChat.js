import React, { useState, useRef } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import { chatWithAI } from "../services/aiService";
import Header from "../components/Common/Header";
import aiimage from "../assets/aiassistant.png";

function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm your ServiceHub AI assistant. Send text or image.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [lastImage, setLastImage] = useState(null);

  const scrollViewRef = useRef(null);

  const fallbackMessage =
    "حالياً ما قدرت أوصل للخدمة، جرّب ترجع لي بعد شوي.";

  const handleSend = async () => {
    const messageValue = input.trim();

    if (!messageValue && !selectedImage) return;

    const imageToSend = selectedImage || lastImage;

    setMessages((prev) => [
      ...prev,
      {
        role: "user",
        text: messageValue || "Sent an image",
        image: selectedImage,
      },
    ]);

    if (selectedImage) {
      setLastImage(selectedImage);
    }

    setInput("");
    setSelectedImage(null);
    setLoading(true);

    try {
      const response = await chatWithAI(
        messageValue || "Analyze this image.",
        imageToSend
      );

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: response.reply || fallbackMessage,
          image: response.url || response.image || null,
        },
      ]);
    } catch (error) {
  console.log("AI MOBILE ERROR:", error.response?.data || error.message);

  setMessages((prev) => [
    ...prev,
    {
      role: "ai",
      text: error.response?.data?.reply || fallbackMessage,
    },
  ]);
} finally {
  setLoading(false);
}
  };

  const pickImage = async () => {
    const permissionResult =
      await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permissionResult.granted) {
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: "لازم تسمحي للتطبيق بالوصول للصور.",
        },
      ]);
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.25,
      base64: true,
    });

    if (!result.canceled && result.assets?.[0]?.base64) {
      const mimeType = result.assets[0].mimeType || "image/jpeg";
      setSelectedImage(`data:${mimeType};base64,${result.assets[0].base64}`);
    }
  };

  const removeSelectedImage = () => {
    setSelectedImage(null);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardArea}
      >
        <View style={styles.chatHeaderBar}>
          <Image source={aiimage} style={styles.avatarImg} />

          <View style={styles.chatTitleBlock}>
            <Text style={styles.chatTitle}>AI Assistant</Text>
            <Text style={styles.chatSubtitle}>Send text or image</Text>
          </View>
        </View>

        <ScrollView
          style={styles.messagesContainer}
          ref={scrollViewRef}
          onContentSizeChange={() =>
            scrollViewRef.current?.scrollToEnd({ animated: true })
          }
        >
          {messages.map((m, i) => (
            <View
              key={i}
              style={[
                styles.messageBubble,
                m.role === "ai" ? styles.otherMessage : styles.myMessage,
              ]}
            >
              {m.image ? (
                <Image source={{ uri: m.image }} style={styles.sentImage} />
              ) : null}

              <Text
                style={[
                  styles.messageText,
                  m.role === "user" ? styles.myText : styles.otherText,
                ]}
              >
                {m.text}
              </Text>
            </View>
          ))}

          {loading ? (
            <View style={[styles.messageBubble, styles.otherMessage]}>
              <ActivityIndicator size="small" color="#000" />
            </View>
          ) : null}
        </ScrollView>

        {selectedImage ? (
          <View style={styles.previewBox}>
            <Image source={{ uri: selectedImage }} style={styles.previewImage} />

            <TouchableOpacity
              style={styles.removeBtn}
              onPress={removeSelectedImage}
            >
              <Text style={styles.removeBtnText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.chatInputArea}>
          <TouchableOpacity onPress={pickImage} style={styles.iconBtn}>
            <Text style={styles.iconText}>📷</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.chatInput}
            placeholder="Ask anything..."
            value={input}
            onChangeText={setInput}
          />

          <TouchableOpacity style={styles.sendBtn} onPress={handleSend}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8DCCF",
  },
  keyboardArea: {
    flex: 1,
  },
  chatHeaderBar: {
    flexDirection: "row",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
    backgroundColor: "#111",
  },
  avatarImg: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 10,
  },
  chatTitleBlock: {
    flex: 1,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
  },
  chatSubtitle: {
    fontSize: 12,
    color: "#ddd",
  },
  messagesContainer: {
    flex: 1,
    padding: 15,
  },
  messageBubble: {
    maxWidth: "82%",
    padding: 12,
    borderRadius: 15,
    marginBottom: 10,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#111",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#F8F1EA",
    borderWidth: 1,
    borderColor: "#D8C7B5",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  myText: {
    color: "#fff",
  },
  otherText: {
    color: "#000",
  },
  sentImage: {
    width: 220,
    height: 180,
    borderRadius: 10,
    marginBottom: 7,
  },
  previewBox: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#F8F1EA",
  },
  previewImage: {
    width: 75,
    height: 60,
    borderRadius: 8,
    marginRight: 10,
  },
  removeBtn: {
    backgroundColor: "#111",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  removeBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
  chatInputArea: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    alignItems: "center",
    backgroundColor: "#E8DCCF",
  },
  chatInput: {
    flex: 1,
    backgroundColor: "#F8F1EA",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#D8C7B5",
  },
  iconBtn: {
    padding: 7,
    marginRight: 5,
  },
  iconText: {
    fontSize: 20,
  },
  sendBtn: {
    backgroundColor: "#111",
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 20,
  },
  sendBtnText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default AIChat;