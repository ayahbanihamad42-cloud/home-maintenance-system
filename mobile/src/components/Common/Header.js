import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
  ScrollView,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";
import API from "../../services/api";

function Header() {
  const navigation = useNavigation();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [notifications, setNotifications] = useState([]);

  const loadUser = async () => {
    const savedUser = await AsyncStorage.getItem("user");
    setUser(savedUser ? JSON.parse(savedUser) : null);
  };

  const loadNotifications = async () => {
    try {
      let res;

      try {
        res = await API.get("/notifications/feed");
      } catch {
        res = await API.get("/notifications");
      }

      setNotifications(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("mobile notifications error:", err?.response?.data || err.message);
      setNotifications([]);
    }
  };

  useEffect(() => {
    loadUser();
    loadNotifications();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");

    setMenuOpen(false);
    setNotifOpen(false);

    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const goTo = (screen, params = {}) => {
    setMenuOpen(false);
    setNotifOpen(false);
    navigation.navigate(screen, params);
  };

  const openMenu = async () => {
    await loadUser();
    setNotifOpen(false);
    setMenuOpen(true);
  };

  const openNotifications = async () => {
    setMenuOpen(false);
    await loadNotifications();
    setNotifOpen(true);
  };

  const role = String(user?.role || "").toLowerCase();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleNotificationPress = (item) => {
    setNotifOpen(false);

    if (item.chatUserId || item.sender_id) {
      goTo("Chat", {
        userId: item.chatUserId || item.sender_id,
        receiverId: item.chatUserId || item.sender_id,
        name: item.sender_name || "Chat",
      });
      return;
    }

    if (item.requestId || item.request_id) {
      goTo("Review", {
        requestId: item.requestId || item.request_id,
      });
      return;
    }

    goTo(role === "technician" ? "TechnicianRequests" : "MaintenanceHistory");
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={openMenu}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title} numberOfLines={2}>
          Maintenance System
        </Text>

        <TouchableOpacity style={styles.bellBtn} onPress={openNotifications}>
          <Text style={styles.bell}>🔔</Text>
          {unreadCount > 0 ? (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{unreadCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={menuOpen} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.menuBox}>
            <Text style={styles.menuTitle}>Menu</Text>

            {role === "technician" ? (
              <>
                <TouchableOpacity onPress={() => goTo("TechnicianDashboard")}>
                  <Text style={styles.menuItem}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goTo("TechnicianRequests")}>
                  <Text style={styles.menuItem}>Requests</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goTo("UserProfile")}>
                  <Text style={styles.menuItem}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goTo("ChatList")}>
                  <Text style={styles.menuItem}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goTo("AIChat")}>
                  <Text style={styles.menuItem}>AI Assistant</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={() => goTo("Home")}>
                  <Text style={styles.menuItem}>Home</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goTo("MaintenanceHistory")}>
                  <Text style={styles.menuItem}>Requests History</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goTo("UserProfile")}>
                  <Text style={styles.menuItem}>Profile</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goTo("ChatList")}>
                  <Text style={styles.menuItem}>Chat</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goTo("AIChat")}>
                  <Text style={styles.menuItem}>AI Assistant</Text>
                </TouchableOpacity>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={notifOpen} animationType="fade">
        <Pressable style={styles.overlayRight} onPress={() => setNotifOpen(false)}>
          <Pressable style={styles.notifBox}>
            <Text style={styles.menuTitle}>Notifications</Text>

            {notifications.length === 0 ? (
              <Text style={styles.emptyText}>No notifications.</Text>
            ) : (
              <ScrollView style={{ maxHeight: 420 }}>
                {notifications.map((item, index) => (
                  <TouchableOpacity
                    key={String(item.id || index)}
                    style={styles.notifItem}
                    onPress={() => handleNotificationPress(item)}
                  >
                    <Text style={styles.notifTitle}>
                      {item.title || item.type || "Notification"}
                    </Text>
                    <Text style={styles.notifBody} numberOfLines={3}>
                      {item.body || item.message || item.content || ""}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    minHeight: 96,
    backgroundColor: "#FFF9F3",
    borderBottomWidth: 1,
    borderBottomColor: "#D8C8B8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
  },
  menuBtn: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    fontSize: 32,
    fontWeight: "900",
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
  },
  bellBtn: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  bell: {
    fontSize: 24,
  },
  badge: {
    position: "absolute",
    top: -4,
    right: -4,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 5,
  },
  badgeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "900",
  },
  logoutBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 13,
    borderRadius: 28,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 100,
    paddingLeft: 16,
  },
  overlayRight: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.20)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 100,
    paddingRight: 12,
  },
  menuBox: {
    width: 260,
    backgroundColor: "#FFF9F3",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  notifBox: {
    width: 310,
    backgroundColor: "#FFF9F3",
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  menuTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 12,
    color: "#111",
  },
  menuItem: {
    fontSize: 18,
    fontWeight: "800",
    paddingVertical: 12,
    color: "#111",
  },
  emptyText: {
    fontSize: 15,
    color: "#6B5E52",
    paddingVertical: 10,
  },
  notifItem: {
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
  },
  notifTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111",
    marginBottom: 4,
  },
  notifBody: {
    fontSize: 14,
    color: "#6B5E52",
  },
});

export default Header;