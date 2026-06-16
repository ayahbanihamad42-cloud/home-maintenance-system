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
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import { getUserNotifications } from "../../services/notificationService";

function Header({ navigation, title = "Home" }) {
  const { t, i18n } = useTranslation();
  const { theme, toggleTheme, c } = useTheme();
  const currentLang = i18n.language?.startsWith("ar") ? "ar" : "en";

  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [user, setUser] = useState({});
  const [role, setRole] = useState("user");
  const [notifications, setNotifications] = useState([]);

  const loadUser = async () => {
    const raw = await AsyncStorage.getItem("user");
    const current = raw ? JSON.parse(raw) : {};
    setUser(current);
    setRole(String(current.role || "user").toLowerCase());
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

  const go = (screen) => {
    setMenuVisible(false);

    if (screen === "CHAT_CARD") {
      setTimeout(() => global.openMobileChatCard?.(), 120);
      return;
    }

    if (screen === "AI_CARD") {
      setTimeout(() => global.openMobileAICard?.(), 120);
      return;
    }

    navigation.navigate(screen);
  };

  const openNotificationTarget = (item) => {
    setNotifVisible(false);

    const ntitle = String(item.title || item.type || "").toLowerCase();
    const body = String(item.message || item.body || "").toLowerCase();

    const senderId =
      item.sender_id ||
      item.senderId ||
      item.from_user_id ||
      item.fromUserId ||
      item.other_user_id ||
      item.otherUserId ||
      item.user_id ||
      item.customer_id ||
      item.technician_user_id ||
      item.technicianUserId;

    const senderName =
      item.sender_name ||
      item.senderName ||
      item.from_name ||
      item.user_name ||
      item.customer_name ||
      item.technician_name ||
      "Chat";

    if (ntitle.includes("message") || body.includes("message") || body.includes("maps")) {
      if (senderId && Number(senderId) !== Number(user.id)) {
        setTimeout(() => {
          global.openMobileChatWith?.({
            id: senderId,
            name: senderName,
          });
        }, 150);
      } else {
        setTimeout(() => global.openMobileChatCard?.(), 150);
      }
      return;
    }

    if (ntitle.includes("payment") || body.includes("payment")) {
      navigation.navigate("PaymentSuccess", {
        requestId: item.request_id || item.requestId,
        amount: item.amount || item.total_price,
      });
      return;
    }

    if (ntitle.includes("request") || body.includes("request")) {
      navigation.navigate(role === "technician" ? "TechnicianRequests" : "MaintenanceHistory");
      return;
    }

    navigation.navigate(role === "technician" ? "TechnicianDashboard" : "Home");
  };

  const profileImage =
    user.profile_image || user.profileImage || user.photo || user.image || "";

  const menuItems =
    role === "technician"
      ? [
          [t("nav.dashboard"), "TechnicianDashboard"],
          [t("nav.profile"), "UserProfile"],
          [t("nav.chat"), "CHAT_CARD"],
          [t("nav.aiAssistant"), "AI_CARD"],
        ]
      : role === "admin"
      ? [
          [t("nav.dashboard"), "AdminDashboard"],
          [t("nav.chat"), "CHAT_CARD"],
          [t("nav.aiAssistant"), "AI_CARD"],
        ]
      : [
          [t("nav.home"), "Home"],
          [t("nav.requests"), "MaintenanceHistory"],
          [t("nav.profile"), "UserProfile"],
          [t("nav.chat"), "CHAT_CARD"],
          [t("nav.aiAssistant"), "AI_CARD"],
        ];

  const s = styles(c);

  return (
    <>
      <View style={s.header}>
        <TouchableOpacity style={s.menuButton} onPress={() => setMenuVisible(true)}>
          <Text style={s.menuIcon}>☰</Text>
        </TouchableOpacity>

        {profileImage ? (
          <Image source={{ uri: profileImage }} style={s.headerImage} />
        ) : (
          <View style={s.headerImageFallback}>
            <Text style={s.headerImageText}>
              {String(user.name || "خ").charAt(0).toUpperCase()}
            </Text>
          </View>
        )}

        <View style={s.brandWrap}>
          <Text style={s.brand}>{t("brand")}</Text>
          <Text style={s.subtitle}>{title}</Text>
        </View>

        <TouchableOpacity style={s.iconButton} onPress={openNotifications}>
          <Text style={s.icon}>🔔</Text>
        </TouchableOpacity>

        <TouchableOpacity style={s.exitButton} onPress={logout}>
          <Text style={s.exitText}>{t("nav.logout")}</Text>
        </TouchableOpacity>
      </View>

      {/* Side Menu */}
      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable style={s.overlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={s.menuBox}>
            <Text style={s.menuTitle}>{t("brand")}</Text>

            {/* Language & Theme Toggles */}
            <View style={s.toggleRow}>
              <View style={s.toggleGroup}>
                <TouchableOpacity
                  style={[s.toggleBtn, currentLang === "en" && s.toggleBtnActive]}
                  onPress={() => i18n.changeLanguage("en")}
                >
                  <Text style={[s.toggleText, currentLang === "en" && s.toggleTextActive]}>EN</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.toggleBtn, currentLang === "ar" && s.toggleBtnActive]}
                  onPress={() => i18n.changeLanguage("ar")}
                >
                  <Text style={[s.toggleText, currentLang === "ar" && s.toggleTextActive]}>عربي</Text>
                </TouchableOpacity>
              </View>

              <View style={s.toggleGroup}>
                <TouchableOpacity
                  style={[s.toggleBtn, theme === "light" && s.toggleBtnActive]}
                  onPress={() => theme !== "light" && toggleTheme()}
                >
                  <Text style={[s.toggleText, theme === "light" && s.toggleTextActive]}>☀️</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[s.toggleBtn, theme === "dark" && s.toggleBtnActive]}
                  onPress={() => theme !== "dark" && toggleTheme()}
                >
                  <Text style={[s.toggleText, theme === "dark" && s.toggleTextActive]}>🌙</Text>
                </TouchableOpacity>
              </View>
            </View>

            {menuItems.map(([label, screen]) => (
              <TouchableOpacity key={label} style={s.menuItem} onPress={() => go(screen)}>
                <Text style={s.menuText}>{label}</Text>
                <Text style={s.menuArrow}>{currentLang === "ar" ? "‹" : "›"}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Notifications */}
      <Modal transparent visible={notifVisible} animationType="fade">
        <Pressable style={s.overlay} onPress={() => setNotifVisible(false)}>
          <Pressable style={s.notifBox}>
            <View style={s.notifHeader}>
              <Text style={s.notifTitle}>{t("nav.notifications")}</Text>
              <TouchableOpacity onPress={() => setNotifVisible(false)}>
                <Text style={s.close}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.length === 0 ? (
                <View style={s.notifCard}>
                  <Text style={s.notifStrong}>{t("nav.noNotifications")}</Text>
                </View>
              ) : (
                notifications.map((item, index) => (
                  <TouchableOpacity
                    key={item.id || index}
                    style={s.notifCard}
                    onPress={() => openNotificationTarget(item)}
                  >
                    <Text style={s.notifStrong}>
                      {item.title || item.type || t("nav.notification")}
                    </Text>
                    <Text style={s.notifText}>
                      {item.message || item.body || "-"}
                    </Text>
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = (c) =>
  StyleSheet.create({
    header: {
      minHeight: 112,
      backgroundColor: c.headerBg || c.card,
      borderBottomWidth: 1,
      borderBottomColor: c.border,
      paddingHorizontal: 18,
      paddingTop: 10,
      flexDirection: "row",
      alignItems: "center",
      gap: 12,
      elevation: 5,
    },
    menuButton: {
      width: 58,
      height: 58,
      borderRadius: 22,
      backgroundColor: c.primarySoft,
      justifyContent: "center",
      alignItems: "center",
    },
    menuIcon: { color: c.primary, fontSize: 30, fontWeight: "900" },
    headerImage: { width: 48, height: 48, borderRadius: 24 },
    headerImageFallback: {
      width: 48,
      height: 48,
      borderRadius: 24,
      backgroundColor: c.primarySoft,
      justifyContent: "center",
      alignItems: "center",
    },
    headerImageText: { color: c.primary, fontWeight: "900", fontSize: 18 },
    brandWrap: { flex: 1, alignItems: "center", marginLeft: -12 },
    brand: { color: c.primary, fontSize: 36, fontWeight: "900", lineHeight: 38 },
    subtitle: { color: c.muted, fontSize: 15, fontWeight: "900", marginTop: 2 },
    iconButton: {
      width: 58,
      height: 58,
      borderRadius: 22,
      backgroundColor: c.primarySoft,
      justifyContent: "center",
      alignItems: "center",
    },
    icon: { fontSize: 25 },
    exitButton: {
      height: 58,
      paddingHorizontal: 18,
      borderRadius: 24,
      backgroundColor: c.primary,
      justifyContent: "center",
    },
    exitText: { color: "#fff", fontWeight: "900", fontSize: 17 },
    overlay: {
      flex: 1,
      backgroundColor: c.overlay || "rgba(31,22,51,0.38)",
      padding: 22,
      justifyContent: "center",
    },
    menuBox: {
      backgroundColor: c.menuBg || c.card,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: c.border,
      padding: 20,
    },
    menuTitle: { color: c.primary, fontSize: 34, fontWeight: "900", marginBottom: 8 },
    toggleRow: {
      flexDirection: "row",
      gap: 10,
      marginBottom: 16,
    },
    toggleGroup: {
      flexDirection: "row",
      backgroundColor: c.primarySoft,
      borderRadius: 14,
      padding: 3,
      gap: 2,
    },
    toggleBtn: {
      paddingVertical: 8,
      paddingHorizontal: 14,
      borderRadius: 11,
    },
    toggleBtnActive: {
      backgroundColor: c.primary,
    },
    toggleText: {
      fontSize: 14,
      fontWeight: "800",
      color: c.muted,
    },
    toggleTextActive: {
      color: "#FFFFFF",
    },
    menuItem: {
      backgroundColor: c.menuItemBg || c.primarySoft,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 20,
      padding: 16,
      marginBottom: 12,
      flexDirection: "row",
      justifyContent: "space-between",
    },
    menuText: { color: c.text, fontSize: 17, fontWeight: "900" },
    menuArrow: { color: c.primary, fontSize: 24, fontWeight: "900" },
    notifBox: {
      backgroundColor: c.menuBg || c.card,
      borderRadius: 30,
      borderWidth: 1,
      borderColor: c.border,
      padding: 20,
      maxHeight: "72%",
    },
    notifHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
    notifTitle: { color: c.primary, fontSize: 34, fontWeight: "900", marginBottom: 16 },
    close: { color: c.text, fontSize: 28, fontWeight: "900" },
    notifCard: {
      backgroundColor: c.menuItemBg || c.primarySoft,
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 22,
      padding: 18,
      marginBottom: 12,
    },
    notifStrong: { color: c.text, fontSize: 18, fontWeight: "900" },
    notifText: { color: c.muted, fontSize: 16, lineHeight: 25, marginTop: 6 },
  });

export default Header;
