import React, { useEffect, useState, useContext, useRef } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  SafeAreaView, 
  KeyboardAvoidingView, 
  Platform,
  Image,
  Linking
} from "react-native";
import { useRoute } from "@react-navigation/native";
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

import { AuthContext } from "../Context/AuthContext";
import { sendChatMessage, getChatMessages } from "../services/chatService.jsx";

function Chat() {
  const route = useRoute();
  const { userId } = route.params;
  const { user } = useContext(AuthContext);
  
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const scrollViewRef = useRef();

  const loadMessages = () => {
    getChatMessages(userId)
      .then((data) => setMessages(data || []))
      .catch(() => setMessages([]));
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
      type: type
    };

    setMessages((prev) => [...prev, pending]);
    if (type === "text") setText("");

    try {
      await sendChatMessage({
        receiver_id: Number(userId),
        message: messageValue,
        type: type
      });
    } catch (e) {
      console.error(e);
    }
    loadMessages();
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

  const shareLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    let location = await Location.getCurrentPositionAsync({});
    const locString = `https://google.com{location.coords.latitude},${location.coords.longitude}`;
    handleSend(locString, "location");
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.chatWrapper}
        keyboardVerticalOffset={90}
      >
        <View style={styles.chatHeaderBar}>
          <View style={styles.chatAvatar}><Text>👷</Text></View>
          <View style={styles.chatTitleBlock}>
            <Text style={styles.chatTitle}>Technician Chat</Text>
            <Text style={styles.chatStatus}>Online</Text>
          </View>
        </View>

        <ScrollView 
          style={styles.messagesContainer}
          ref={scrollViewRef}
          onContentSizeChange={() => scrollViewRef.current.scrollToEnd({ animated: true })}
        >
          {messages.map((m, i) => (
            <View key={i} style={[styles.messageBubble, m.sender_id === user?.id ? styles.myMessage : styles.otherMessage]}>
              {m.type === "image" ? (
                <Image source={{ uri: m.message }} style={styles.sentImage} />
              ) : m.type === "location" ? (
                <TouchableOpacity onPress={() => Linking.openURL(m.message)}>
                  <Text style={[styles.messageText, { color: 'blue', textDecorationLine: 'underline' }]}>📍 View My Location</Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.messageText, m.sender_id === user?.id ? styles.myText : styles.otherText]}>{m.message}</Text>
              )}
            </View>
          ))}
        </ScrollView>

        <View style={styles.chatInputArea}>
          <TouchableOpacity style={styles.iconBtn} onPress={pickImage}><Text style={styles.iconText}>📷</Text></TouchableOpacity>
          <TouchableOpacity style={styles.iconBtn} onPress={shareLocation}><Text style={styles.iconText}>📍</Text></TouchableOpacity>
          
          <TextInput
            style={styles.chatInput}
            placeholder="Type a message..."
            value={text}
            onChangeText={setText}
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
  chatWrapper: { flex: 1 },
  chatHeaderBar: { flexDirection: "row", padding: 15, borderBottomWidth: 1, borderBottomColor: "#eee", alignItems: "center" },
  chatAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#eee", justifyContent: "center", alignItems: "center", marginRight: 10 },
  chatTitleBlock: { flex: 1 },
  chatTitle: { fontSize: 16, fontWeight: "bold" },
  chatStatus: { fontSize: 12, color: "green" },
  messagesContainer: { flex: 1, padding: 15 },
  messageBubble: { maxWidth: "80%", padding: 12, borderRadius: 15, marginBottom: 10 },
  myMessage: { alignSelf: "flex-end", backgroundColor: "#007AFF" },
  otherMessage: { alignSelf: "flex-start", backgroundColor: "#E5E5EA" },
  messageText: { fontSize: 15 },
  myText: { color: "#fff" },
  otherText: { color: "#000" },
  sentImage: { width: 200, height: 150, borderRadius: 10 },
  chatInputArea: { flexDirection: "row", padding: 10, borderTopWidth: 1, borderTopColor: "#eee", alignItems: "center" },
  chatInput: { flex: 1, backgroundColor: "#F2F2F7", borderRadius: 20, paddingHorizontal: 15, paddingVertical: 8, marginRight: 8 },
  iconBtn: { padding: 8 },
  iconText: { fontSize: 20 },
  sendBtn: { backgroundColor: "#007AFF", paddingVertical: 8, paddingHorizontal: 15, borderRadius: 20 },
  sendBtnText: { color: "#fff", fontWeight: "bold" }
});

export default Chat;
