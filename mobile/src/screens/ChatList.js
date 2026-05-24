import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  TextInput,
} from "react-native";
import Header from "../components/Common/Header";
import { getChatConversations } from "../services/chatService";

export default function ChatList({ navigation }) {
  const [conversations, setConversations] = useState([]);
  const [search, setSearch] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadConversations = async () => {
    try {
      setRefreshing(true);
      setError("");

      const data = await getChatConversations();
      setConversations(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("chat list error:", err?.response?.data || err.message);
      setConversations([]);
      setError(err?.response?.data?.message || "Failed to load chats.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadConversations();
    const unsubscribe = navigation.addListener("focus", loadConversations);
    return unsubscribe;
  }, [navigation]);

  const filteredConversations = conversations.filter((item) =>
    String(item.name || "")
      .toLowerCase()
      .includes(search.trim().toLowerCase())
  );

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Chats</Text>

        <View style={styles.topRow}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search chats..."
            style={styles.searchInput}
          />

          <TouchableOpacity style={styles.refreshBtn} onPress={loadConversations}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>
        </View>

        {error ? (
          <View style={styles.messageBox}>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredConversations.length === 0 ? (
          <View style={styles.messageBox}>
            <Text style={styles.emptyText}>
              {refreshing ? "Loading chats..." : "No chats yet."}
            </Text>
          </View>
        ) : (
          filteredConversations.map((item) => (
            <TouchableOpacity
              key={item.userId || item.id}
              style={styles.chatCard}
              onPress={() =>
                navigation.navigate("Chat", {
                  userId: item.userId || item.id,
                  name: item.name,
                })
              }
            >
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>
                  {String(item.name || "?").charAt(0).toUpperCase()}
                </Text>
              </View>

              <View style={styles.chatInfo}>
                <Text style={styles.name}>{item.name || "User"}</Text>
                <Text style={styles.lastMessage} numberOfLines={1}>
                  {item.lastMessageType === "image"
                    ? "📷 Image"
                    : item.lastMessageType === "location"
                    ? "📍 Location"
                    : item.lastMessage || "No messages yet"}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E8DCCF" },
  container: { padding: 24, paddingBottom: 90 },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111",
    marginBottom: 14,
  },
  topRow: {
    gap: 12,
    marginBottom: 18,
  },
  searchInput: {
    backgroundColor: "#FFF9F3",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    minHeight: 54,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111",
    fontWeight: "700",
  },
  refreshBtn: {
    backgroundColor: "#111",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignSelf: "flex-start",
  },
  refreshText: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  messageBox: {
    backgroundColor: "#FFF9F3",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  errorTitle: {
    color: "#B4232B",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 6,
  },
  errorText: { color: "#B4232B", fontSize: 15, fontWeight: "700" },
  emptyText: { fontSize: 18, fontWeight: "800", color: "#5C5048" },
  chatCard: {
    backgroundColor: "#FFF9F3",
    borderRadius: 24,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  avatarText: { color: "#FFF", fontWeight: "900", fontSize: 22 },
  chatInfo: { flex: 1 },
  name: { fontSize: 20, fontWeight: "900", color: "#111", marginBottom: 4 },
  lastMessage: { fontSize: 15, color: "#6B5E55", fontWeight: "700" },
});