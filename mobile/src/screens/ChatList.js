import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Header from "../components/Common/Header";
import API from "../services/api";

const getChatConversations = () =>
  API.get("/chat/conversations").then((res) => res.data);

export default function ChatList({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadConversations);
    return unsubscribe;
  }, [navigation]);

  const loadConversations = () => {
    setLoading(true);

    getChatConversations()
      .then((data) => {
        setConversations(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        console.log("chat conversations error:", err?.response?.data || err.message);
        setConversations([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const renderLastMessage = (item) => {
    if (item.lastMessageType === "image") return "📷 Image";
    if (item.lastMessageType === "location") return "📍 Location";
    return item.lastMessage || "No messages yet";
  };

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Chats</Text>

        {loading ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>Notice</Text>
            <Text style={styles.messageBody}>Loading conversations...</Text>
            <ActivityIndicator color="#111" style={{ marginTop: 14 }} />
          </View>
        ) : conversations.length === 0 ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>No chats yet</Text>
            <Text style={styles.messageBody}>
              Your conversations will appear here when you start chatting.
            </Text>
          </View>
        ) : (
          <View style={styles.chatListGrid}>
            {conversations.map((item) => (
              <TouchableOpacity
                key={item.userId}
                style={styles.chatCard}
                activeOpacity={0.85}
                onPress={() =>
                  navigation.navigate("Chat", {
                    userId: item.userId,
                    receiverId: item.userId,
                    name: item.name,
                    user: {
                      id: item.userId,
                      name: item.name,
                    },
                  })
                }
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {(item.name || "?").charAt(0).toUpperCase()}
                  </Text>
                </View>

                <View style={styles.chatContent}>
                  <View style={styles.chatTop}>
                    <Text style={styles.chatName}>{item.name || "User"}</Text>
                    <Text style={styles.chatTime}>
                      {item.lastMessageAt
                        ? new Date(item.lastMessageAt).toLocaleString()
                        : ""}
                    </Text>
                  </View>

                  <Text style={styles.lastMessage} numberOfLines={1}>
                    {renderLastMessage(item)}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DCCF",
  },
  container: {
    padding: 24,
    paddingBottom: 80,
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#111",
    marginBottom: 34,
  },
  messageBox: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 28,
    padding: 28,
  },
  messageTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
    marginBottom: 10,
  },
  messageBody: {
    fontSize: 19,
    color: "#4D433B",
    lineHeight: 28,
  },
  chatListGrid: {
    gap: 16,
  },
  chatCard: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 26,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },
  chatContent: {
    flex: 1,
  },
  chatTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
  },
  chatName: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
    flex: 1,
  },
  chatTime: {
    fontSize: 11,
    color: "#6F6257",
  },
  lastMessage: {
    marginTop: 6,
    fontSize: 17,
    color: "#6F6257",
  },
});