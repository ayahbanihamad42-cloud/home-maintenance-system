import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { colors } from "../../styles/mobileStyles";

const Header = ({ navigation, title = "خدمة" }) => {
  const [menuVisible, setMenuVisible] = useState(false);
  const [notifVisible, setNotifVisible] = useState(false);
  const [role, setRole] = useState("");

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : {};
      setRole(String(user.role || "").toLowerCase());
    };
    load();
  }, []);

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    navigation.reset({ index: 0, routes: [{ name: "Login" }] });
  };

  const go = (screen) => {
    setMenuVisible(false);
    navigation.navigate(screen);
  };

  const userItems = [
    ["Home", "Home"],
    ["Requests", "MaintenanceHistory"],
    ["Profile", "UserProfile"],
  ];

  const techItems = [
    ["Dashboard", "TechnicianDashboard"],
    ["Requests", "TechnicianRequests"],
    ["Availability", "TechnicianAvailability"],
    ["Profile", "UserProfile"],
  ];

  const adminItems = [["Dashboard", "AdminDashboard"]];

  const items = role === "technician" ? techItems : role === "admin" ? adminItems : userItems;

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconBtn} onPress={() => setMenuVisible(true)}>
          <Text style={styles.iconText}>☰</Text>
        </TouchableOpacity>

        <View style={{ flex: 1 }}>
          <Text style={styles.brand}>خدمة</Text>
          <Text style={styles.subtitle}>{title}</Text>
        </View>

        <TouchableOpacity style={styles.iconBtn} onPress={() => setNotifVisible(true)}>
          <Text style={styles.iconText}>🔔</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Exit</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={menuVisible} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuVisible(false)}>
          <Pressable style={styles.menuBox}>
            <Text style={styles.menuTitle}>خدمة</Text>

            <ScrollView>
              {items.map(([label, screen]) => (
                <TouchableOpacity key={label} style={styles.menuItem} onPress={() => go(screen)}>
                  <Text style={styles.menuItemText}>{label}</Text>
                  <Text style={styles.arrow}>›</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={notifVisible} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setNotifVisible(false)}>
          <Pressable style={styles.menuBox}>
            <Text style={styles.menuTitle}>Notifications</Text>
            <View style={styles.notifCard}>
              <Text style={styles.notifTitle}>No new notifications</Text>
              <Text style={styles.notifText}>
                Messages and request updates will appear here.
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    minHeight: 94,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    gap: 8,
    elevation: 3,
  },
  iconBtn: {
    width: 50,
    height: 50,
    borderRadius: 18,
    backgroundColor: colors.primarySoft,
    alignItems: "center",
    justifyContent: "center",
  },
  iconText: { fontSize: 22, color: colors.primary, fontWeight: "900" },
  brand: { fontSize: 28, fontWeight: "900", color: colors.primary },
  subtitle: { fontSize: 12, color: colors.muted, fontWeight: "800" },
  logoutBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 18,
  },
  logoutText: { color: "#fff", fontWeight: "900" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(31,22,51,0.35)",
    paddingTop: 90,
    paddingLeft: 16,
  },
  menuBox: {
    width: 300,
    maxHeight: "78%",
    backgroundColor: "#fff",
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  menuTitle: { fontSize: 26, fontWeight: "900", color: colors.primary, marginBottom: 12 },
  menuItem: {
    backgroundColor: "#FBFAFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  menuItemText: { color: colors.text, fontSize: 16, fontWeight: "900" },
  arrow: { color: colors.primary, fontSize: 24, fontWeight: "900" },
  notifCard: {
    backgroundColor: "#FBFAFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 14,
  },
  notifTitle: { color: colors.text, fontWeight: "900", fontSize: 16 },
  notifText: { color: colors.muted, marginTop: 4, lineHeight: 21 },
});

export default Header;