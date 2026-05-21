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

  const fallbackMessage = "AI assistant is not available right now.";

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
          text: response?.reply || fallbackMessage,
          image: response?.url || response?.image || null,
        },
      ]);
    } catch (error) {
      console.log("AI MOBILE ERROR:", error?.response?.data || error?.message);

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          text: error?.response?.data?.reply || fallbackMessage,
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
      aspect: [4, 3],
      quality: 0.12,
      base64: true,
    });

    const asset = result.assets?.[0];

    if (!result.canceled && asset?.base64) {
      const mimeType = asset.mimeType || "image/jpeg";
      setSelectedImage(`data:${mimeType};base64,${asset.base64}`);
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
        keyboardVerticalOffset={90}
      >
        <View style={styles.chatHeaderBar}>
          <View style={styles.aiAvatar}>
            <Image source={aiimage} style={styles.avatarImage} />
          </View>

          <View style={styles.chatTitleBlock}>
            <Text style={styles.chatTitle}>AI Assistant</Text>
            <Text style={styles.chatSubtitle}>Send text or image</Text>
          </View>
        </View>

        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
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
                <Image source={{ uri: m.image }} style={styles.messageImage} />
              ) : null}

              <Text
                style={[
                  styles.messageText,
                  m.role === "ai" ? styles.otherText : styles.myText,
                ]}
              >
                {m.text}
              </Text>
            </View>
          ))}

          {loading ? (
            <View style={[styles.messageBubble, styles.otherMessage]}>
              <ActivityIndicator size="small" color="#111" />
              <Text style={styles.otherText}> Thinking...</Text>
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
              <Text style={styles.removeText}>Remove</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.iconBtn} onPress={pickImage}>
            <Text style={styles.iconBtnText}>📷</Text>
          </TouchableOpacity>

          <TextInput
            style={styles.input}
            placeholder="Ask the assistant..."
            value={input}
            onChangeText={setInput}
            multiline={false}
          />

          <TouchableOpacity
            style={[styles.sendBtn, loading && { opacity: 0.6 }]}
            disabled={loading}
            onPress={handleSend}
          >
            <Text style={styles.sendText}>Send</Text>
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
    backgroundColor: "#111",
    paddingHorizontal: 18,
    paddingVertical: 22,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  aiAvatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: "#FFF9F3",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  chatTitleBlock: {
    flex: 1,
  },
  chatTitle: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
  },
  chatSubtitle: {
    color: "#D9CEC2",
    fontSize: 16,
    marginTop: 4,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 18,
    paddingBottom: 28,
  },
  messageBubble: {
    maxWidth: "86%",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
  },
  myMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#111",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  messageText: {
    fontSize: 16,
    lineHeight: 24,
  },
  myText: {
    color: "#FFF",
  },
  otherText: {
    color: "#111",
  },
  messageImage: {
    width: 250,
    height: 180,
    resizeMode: "cover",
    borderRadius: 12,
    marginBottom: 8,
  },
  previewBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#F6EDE2",
    borderTopWidth: 1,
    borderTopColor: "#D8C8B8",
  },
  previewImage: {
    width: 90,
    height: 70,
    borderRadius: 12,
  },
  removeBtn: {
    backgroundColor: "#111",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 999,
  },
  removeText: {
    color: "#FFF",
    fontWeight: "800",
  },
  inputArea: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    padding: 10,
    backgroundColor: "#FFF9F3",
    borderTopWidth: 1,
    borderTopColor: "#D8C8B8",
  },
  iconBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#F6EDE2",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  iconBtnText: {
    fontSize: 22,
  },
  input: {
    flex: 1,
    height: 54,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    backgroundColor: "#F6EDE2",
    paddingHorizontal: 18,
    fontSize: 16,
  },
  sendBtn: {
    height: 54,
    borderRadius: 27,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  sendText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "900",
  },
});

export default AIChat;