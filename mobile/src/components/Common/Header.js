import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

function Header() {
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);

  const openMenu = async () => {
    const savedUser = await AsyncStorage.getItem("user");
    setUser(savedUser ? JSON.parse(savedUser) : null);
    setOpen(true);
  };

  const logout = async () => {
    await AsyncStorage.removeItem("token");
    await AsyncStorage.removeItem("user");
    setOpen(false);
    navigation.reset({
      index: 0,
      routes: [{ name: "Login" }],
    });
  };

  const goTo = (screen) => {
    setOpen(false);
    navigation.navigate(screen);
  };

  const role = user?.role;

  return (
    <>
      <View style={styles.header}>
        <TouchableOpacity style={styles.menuBtn} onPress={openMenu}>
          <Text style={styles.menuIcon}>☰</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Maintenance System</Text>

        <TouchableOpacity style={styles.bellBtn}>
          <Text style={styles.bell}>🔔</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
          <Text style={styles.logoutText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      <Modal transparent visible={open} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setOpen(false)}>
          <View style={styles.menuBox}>
            <Text style={styles.menuTitle}>Menu</Text>

            {role === "technician" ? (
              <>
                <TouchableOpacity onPress={() => goTo("TechnicianDashboard")}>
                  <Text style={styles.menuItem}>Dashboard</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => goTo("TechnicianProfile")}>
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
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 78,
    backgroundColor: "#FFF9F3",
    borderBottomWidth: 1,
    borderBottomColor: "#D8C8B8",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 12,
  },
  menuBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: {
    fontSize: 30,
    fontWeight: "900",
  },
  title: {
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
  },
  bellBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    alignItems: "center",
    justifyContent: "center",
  },
  bell: {
    fontSize: 24,
  },
  logoutBtn: {
    backgroundColor: "#111",
    paddingHorizontal: 18,
    paddingVertical: 13,
    borderRadius: 28,
  },
  logoutText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 15,
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-start",
    alignItems: "flex-start",
    paddingTop: 85,
    paddingLeft: 16,
  },
  menuBox: {
    width: 260,
    backgroundColor: "#FFF9F3",
    borderRadius: 22,
    padding: 18,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  menuTitle: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 12,
  },
  menuItem: {
    fontSize: 18,
    fontWeight: "800",
    paddingVertical: 12,
    color: "#111",
  },
});

export default Header;