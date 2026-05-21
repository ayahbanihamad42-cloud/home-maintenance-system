import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import API from "../services/api";

export default function ChatList({ navigation, route }) {
  const user = route?.params?.user || {};
  const userId = user?.id || user?.user_id;

  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadChats = async () => {
    try {
      setLoading(true);

      const res = await API.get("/chat/list");
      setChats(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("chat list error:", err.response?.data || err.message);
      setChats([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChats();
  }, []);

  const getOtherUserId = (chat) => {
    return (
      chat.other_user_id ||
      chat.userId ||
      chat.receiver_id ||
      chat.sender_id ||
      chat.id
    );
  };

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Chats</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#111" />
        ) : chats.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.empty}>No chats found.</Text>
          </View>
        ) : (
          chats.map((chat, index) => {
            const otherId = getOtherUserId(chat);
            const name = chat.name || chat.other_name || chat.sender_name || "User";
            const last = chat.last_message || chat.message || "";

            return (
              <TouchableOpacity
                key={`${otherId}-${index}`}
                style={styles.chatCard}
                onPress={() =>
                  navigation.navigate("Chat", {
                    userId: otherId,
                    receiverId: otherId,
                    name,
                    user: { id: otherId, name },
                  })
                }
              >
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{String(name).charAt(0).toUpperCase()}</Text>
                </View>

                <View style={styles.chatBody}>
                  <Text style={styles.name}>{name}</Text>
                  <Text style={styles.preview} numberOfLines={1}>
                    {last || "No messages yet"}
                  </Text>
                </View>

                <Text style={styles.time}>
                  {chat.created_at ? new Date(chat.created_at).toLocaleDateString() : ""}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

function Header({ navigation }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuBtn} onPress={() => setOpen(!open)}>
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Maintenance System</Text>

      <TouchableOpacity style={styles.bell}>
        <Text style={styles.bellText}>🔔</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Text style={styles.menuItem}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("MaintenanceHistory")}>
            <Text style={styles.menuItem}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("UserProfile")}>
            <Text style={styles.menuItem}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("AIChat")}>
            <Text style={styles.menuItem}>AI Assistant</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("ChatList")}>
            <Text style={styles.menuItem}>Chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e7dccc" },
  header: {
    minHeight: 96,
    backgroundColor: "#faf5ef",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#d8c8b8",
    zIndex: 100,
  },
  menuBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  menuText: { fontSize: 34, fontWeight: "900" },
  headerTitle: { flex: 1, fontSize: 26, fontWeight: "900", marginLeft: 12 },
  bell: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bellText: { fontSize: 26 },
  logout: {
    backgroundColor: "#111",
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 28,
  },
  logoutText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  menu: {
    position: "absolute",
    top: 88,
    left: 18,
    width: 230,
    backgroundColor: "#fffaf4",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d8c8b8",
    elevation: 10,
  },
  menuItem: { fontSize: 18, fontWeight: "800", paddingVertical: 12 },
  container: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 40, fontWeight: "900", marginBottom: 22 },
  emptyCard: {
    backgroundColor: "#fffaf4",
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  empty: { fontSize: 22, textAlign: "center" },
  chatCard: {
    backgroundColor: "#fffaf4",
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: "#d8c8b8",
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
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
  avatarText: { color: "#fff", fontSize: 24, fontWeight: "900" },
  chatBody: { flex: 1 },
  name: { fontSize: 21, fontWeight: "900" },
  preview: { fontSize: 16, color: "#6b5e55", marginTop: 4 },
  time: { fontSize: 13, color: "#6b5e55" },
});