import React, { useEffect, useState, useRef } from "react";
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
  ActivityIndicator
} from "react-native";
import * as ImagePicker from 'expo-image-picker';

import { chatWithAI, generateAIImage } from "../services/aiService";
import Header from "../components/common/Header";
import aiimage from "../images/aiassistant.png";

function AIChat() {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      text: "Hello! I'm your ServiceHub AI assistant. I can chat and generate images for you!"
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollViewRef = useRef();

  const fallbackMessage = "حالياً ما قدرت أوصل للخدمة، جرّب ترجع لي بعد شوي.";

  const handleSend = async (content = null, type = "text") => {
    const messageValue = content || input;
    if (!messageValue.trim()) return;

    setMessages((prev) => [
      ...prev, 
      { 
        role: "user", 
        text: type === "text" ? messageValue : "Sent an image", 
        image: type === "image" ? messageValue : null 
      }
    ]);
    
    if (type === "text") setInput("");
    setLoading(true);

    try {
      if (type === "text" && messageValue.toLowerCase().startsWith("/draw")) {
        const prompt = messageValue.replace("/draw", "").trim();
        const response = await generateAIImage(prompt);
        setMessages((prev) => [
          ...prev, 
          { role: "ai", text: `Here is your image for: ${prompt}`, image: response.url }
        ]);
      } else {
        const response = await chatWithAI(messageValue);
        setMessages((prev) => [...prev, { role: "ai", text: response.reply }]);
      }
    } catch (error) {
      setMessages((prev) => [...prev, { role: "ai", text: fallbackMessage }]);
    } finally {
      setLoading(false);
    }
  };

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.5,
      base64: true,
    });

    if (!result.canceled) {
      handleSend(`data:image/jpeg;base64,${result.assets[0].base64}`, "image");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={{ flex: 1 }}
      >
        <View style={styles.chatHeaderBar}>
          <Image source={aiimage} style={styles.avatarImg} />
          <View style={styles.chatTitleBlock}>
            <Text style={styles.chatTitle}>AI Assistant</Text>
            <Text style={styles.chatSubtitle}>Use /draw [prompt] to create images</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.messagesContainer}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {messages.map((m, i) => (
            <View key={i} style={[styles.messageBubble, m.role === "ai" ? styles.otherMessage : styles.myMessage]}>
              {m.image && <Image source={{ uri: m.image }} style={styles.sentImage} />}
              <Text style={[styles.messageText, m.role === "user" ? styles.myText : styles.otherText]}>
                {m.text}
              </Text>
            </View>
          ))}
          {loading && (
            <View style={[styles.messageBubble, styles.otherMessage]}>
              <ActivityIndicator size="small" color="#000" />
            </View>
          )}
        </ScrollView>

        <View style={styles.chatInputArea}>
          <TouchableOpacity onPress={pickImage} style={styles.iconBtn}>
            <Text style={{ fontSize: 20 }}>📷</Text>
          </TouchableOpacity>
          <TextInput
            style={styles.chatInput}
            placeholder="Ask or use /draw..."
            value={input}
            onChangeText={setInput}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={() => handleSend()}>
            <Text style={styles.sendBtnText}>Send</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  chatHeaderBar: { flexDirection: "row", padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee", alignItems: "center" },
  avatarImg: { width: 40, height: 40, borderRadius: 20, marginRight: 10 },
  chatTitleBlock: { flex: 1 },
  chatTitle: { fontSize: 16, fontWeight: "bold" },
  chatSubtitle: { fontSize: 12, color: "#888" },
  messagesContainer: { flex: 1, padding: 15 },
  messageBubble: { maxWidth: "80%", padding: 12, borderRadius: 15, marginBottom: 10 },
  myMessage: { alignSelf: "flex-end", backgroundColor: "#007AFF" },
  otherMessage: { alignSelf: "flex-start", backgroundColor: "#E5E5EA" },
  messageText: { fontSize: 15 },
  myText: { color: "#fff" },
  otherText: { color: "#000" },
  sentImage: { width: 220, height: 180, borderRadius: 10, marginBottom: 5 },
  chatInputArea: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderTopColor: "#eee", alignItems: "center" },
  chatInput: { flex: 1, backgroundColor: "#F2F2F7", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 10 },
  iconBtn: { padding: 5, marginRight: 5 },
  sendBtn: { backgroundColor: "#007AFF", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  sendBtnText: { color: "#fff", fontWeight: "bold" }
});

export default AIChat;

