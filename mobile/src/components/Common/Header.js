import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../styles/mobileStyles";
import { getUserNotifications } from "../../services/notificationService";

function Header({ navigation, title = "Home" }) {
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [role, setRole] = useState("");
  const [user, setUser] = useState({});
  const [notifications, setNotifications] = useState([]);

  const loadUser = async () => {
    const raw = await AsyncStorage.getItem("user");
    const currentUser = raw ? JSON.parse(raw) : {};
    setUser(currentUser);
    setRole(String(currentUser.role || "user").toLowerCase());
  };

  useEffect(() => {
    loadUser();
    const unsub = navigation?.addListener?.("focus", loadUser);
    return unsub;
  }, [navigation]);

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const openNotifications = async () => {
    try {
      setNotifVisible(true);
      const data = await getUserNotifications();
      setNotifications(Array.isArray(data) ? data : []);
    } catch {
      setNotifications([]);
    }
  };

  const profileImage =
    user.profile_image || user.profileImage || user.photo || user.image || "";

  const menuItems =
    role === "technician"
      ? [
          ["Dashboard", "TechnicianDashboard"],
          ["Requests", "TechnicianRequests"],
          ["Availability", "TechnicianAvailability"],
          ["Gallery", "TechnicianGalleryManager"],
          ["Profile", "UserProfile"],
          ["Chat", "CHAT_CARD"],
          ["AI Assistant", "AI_CARD"],
        ]
      : role === "admin"
      ? [["Dashboard", "AdminDashboard"]]
      : [
          ["Home", "Home"],
          ["Requests", "MaintenanceHistory"],
          ["Profile", "UserProfile"],
          ["Chat", "CHAT_CARD"],
          ["AI Assistant", "AI_CARD"],
        ];

  const go = (screen) => {
    setMenuVisible(false);

    if (screen === "CHAT_CARD") {
      setTimeout(() => global.openMobileChatCard?.(), 80);
      return;
    }

    if (screen === "AI_CARD") {
      setTimeout(() => global.openMobileAICard?.(), 80);
      return;
    }

    navigation.navigate(screen);
  };

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setMenuVisible(true)}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        {profileImage ? (
          <Image source={{ uri: profileImage }} style={styles.headerImage} />
        ) : (
          <View style={styles.headerImageFallback}>
            <Text style={styles.headerImageText}>
              {String(user.name || "خ").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.brandWrap}>
          <Text style={styles.brand}>خدمة</Text>
          <Text style={styles.subtitle}>{title}</Text>
        </View>

        <TouchableOpacity style={styles.iconButton} onPress={openNotifications}>
          <Text style={styles.icon}>🔔</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.exitButton} onPress={logout}>
          <Text style={styles.exitText}>Exit</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.menuBox}>
            <Text style={styles.menuTitle}>خدمة</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {menuItems.map(([label, screen]) => (
                <TouchableOpacity key={label} style={styles.menuItem} onPress={() => go(screen)}>
                  <Text style={styles.menuText}>{label}</Text>
                  <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={notifVisible} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setNotifVisible(false)}>
          <Pressable style={styles.notifBox}>
            <Text style={styles.notifTitle}>Notifications</Text>

            {notifications.length === 0 ? (
              <View style={styles.notifCard}>
                <Text style={styles.notifStrong}>No new notifications</Text>
                <Text style={styles.notifText}>
                  Messages and request updates will appear here.
                </Text>
              </View>
            ) : (
              <ScrollView>
                {notifications.map((item, index) => (
                  <View style={styles.notifCard} key={item.id || index}>
                    <Text style={styles.notifStrong}>{item.title || "Notification"}</Text>
                    <Text style={styles.notifText}>{item.message || item.body || "-"}</Text>
                  </View>
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
    minHeight: 112,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: 18,
    paddingTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    elevation: 5,
    shadowColor: colors.primaryDark,
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },
  menuButton: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  menuIcon: {
    color: colors.primary,
    fontSize: 30,
    fontWeight: "900",
  },
  headerImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  headerImageFallback: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  headerImageText: {
    color: colors.primaryDark,
    fontWeight: "900",
    fontSize: 18,
  },
  brandWrap: {
    flex: 1,
    alignItems: "center",
    marginLeft: -12,
  },
  brand: {
    color: colors.primary,
    fontSize: 36,
    fontWeight: "900",
    lineHeight: 38,
  },
  subtitle: {
    color: colors.muted,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 2,
  },
  iconButton: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: colors.primarySoft,
    justifyContent: "center",
    alignItems: "center",
  },
  icon: {
    fontSize: 25,
  },
  exitButton: {
    height: 58,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  exitText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 17,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(31,22,51,0.38)",
    padding: 22,
    justifyContent: "center",
  },
  menuBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    maxHeight: "78%",
  },
  menuTitle: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 16,
  },
  menuItem: {
    backgroundColor: "#FBFAFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  menuText: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
  },
  menuArrow: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
  },
  notifBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 30,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
    maxHeight: "70%",
  },
  notifTitle: {
    color: colors.primary,
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 16,
  },
  notifCard: {
    backgroundColor: "#FBFAFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 18,
  },
  notifStrong: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
  },
  notifText: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 25,
    marginTop: 6,
  },
});

export default Header;