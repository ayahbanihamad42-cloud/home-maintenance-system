import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/Common/Header";
import API from "../services/api";

export default function ChatList({ navigation }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const loadChats = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const rawUser = await AsyncStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;

      if (!user?.id) {
        setChats([]);
        setMessage({
          title: "Notice",
          body: "User id is missing. Please login again.",
        });
        return;
      }

      const res = await API.get("/chat/list");
      setChats(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("chat list error:", err?.response?.data || err.message);
      setChats([]);
      setMessage({
        title: "Error",
        body: err?.response?.data?.message || "Failed to load chats.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadChats);
    return unsubscribe;
  }, [navigation]);

  const getOtherId = (chat) =>
    chat.other_user_id ||
    chat.otherUserId ||
    chat.chat_user_id ||
    chat.receiver_id ||
    chat.sender_id ||
    chat.user_id ||
    chat.id;

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Chats</Text>

        {message ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>{message.title}</Text>
            <Text style={styles.messageBody}>{message.body}</Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color="#111" style={{ marginTop: 40 }} />
        ) : chats.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No chats found.</Text>
          </View>
        ) : (
          chats.map((chat, index) => {
            const otherId = getOtherId(chat);
            const name =
              chat.other_name ||
              chat.name ||
              chat.sender_name ||
              chat.receiver_name ||
              "User";

            return (
              <TouchableOpacity
                key={`${otherId}-${index}`}
                style={styles.chatCard}
                onPress={() =>
                  navigation.navigate("Chat", {
                    userId: otherId,
                    receiverId: otherId,
                    name,
                  })
                }
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {String(name).charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.chatInfo}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.preview} numberOfLines={1}>
                    {chat.last_message || chat.message || "No messages yet"}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E7DCCC" },
  container: { padding: 24, paddingBottom: 80 },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#111",
    marginBottom: 24,
  },
  messageBox: {
    backgroundColor: "#FDEBED",
    borderWidth: 1,
    borderColor: "#EFB6BD",
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  messageTitle: { fontSize: 17, fontWeight: "900" },
  messageBody: { marginTop: 6, fontSize: 16, color: "#A32020" },
  emptyCard: {
    backgroundColor: "#FFFAF4",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 26,
    padding: 34,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 22,
    color: "#4D433B",
  },
  chatCard: {
    backgroundColor: "#FFFAF4",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 26,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
  },
  chatInfo: { flex: 1 },
  name: { fontSize: 22, fontWeight: "900", color: "#111" },
  preview: { fontSize: 16, color: "#6B5E52", marginTop: 4 },
});