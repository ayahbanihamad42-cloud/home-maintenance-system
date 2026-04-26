import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  Pressable,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import appStyles from "../../styles/mobileStyles";

function normalizeRole(role) {
  return role ? String(role).trim().toLowerCase() : "";
}

function Header() {
  const navigation = useNavigation();
  const route = useRoute();

  const [menuVisible, setMenuVisible] = useState(false);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [user, setUser] = useState(null);

  const currentRoute = route?.name || "";

  useEffect(() => {
    const loadUser = async () => {
      try {
        const raw = await AsyncStorage.getItem("user");
        if (raw) {
          setUser(JSON.parse(raw));
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Header user load error:", error);
        setUser(null);
      }
    };

    loadUser();
  }, []);

  const role = normalizeRole(user?.role);

  const menuItems = useMemo(() => {
    if (role === "admin") {
      return [
        { label: "Dashboard", screen: "AdminDashboard" },
        { label: "AI Assistant", screen: "AIChat" },
      ];
    }

    if (role === "technician") {
      return [
        { label: "Dashboard", screen: "TechnicianDashboard" },
        { label: "Profile", screen: "Profile" },
        { label: "Requests", screen: "TechnicianRequests" },
        { label: "Availability", screen: "TechnicianAvailability" },
        { label: "Chats", screen: "ChatList" },
        { label: "AI Assistant", screen: "AIChat" },
      ];
    }

    return [
      { label: "Home", screen: "Home" },
      { label: "Requests History", screen: "History" },
      { label: "Profile", screen: "Profile" },
      { label: "Chats", screen: "ChatList" },
      { label: "AI Assistant", screen: "AIChat" },
    ];
  }, [role]);

  const handleNavigate = (screen) => {
    setMenuVisible(false);

    if (screen && screen !== currentRoute) {
      navigation.navigate(screen);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("token");
      await AsyncStorage.removeItem("user");
    } catch (error) {
      console.error("Logout error:", error);
    }

    setMenuVisible(false);

    navigation.reset({
      index: 0,
      routes: [{ name: "Welcome" }],
    });
  };

  return (
    <>
      <View style={appStyles.mobileHeader}>
        <View style={appStyles.mobileHeaderLeft}>
          <TouchableOpacity
            style={appStyles.mobileHeaderIconBtn}
            onPress={() => setMenuVisible(true)}
          >
            <Text style={appStyles.mobileHeaderIconText}>☰</Text>
          </TouchableOpacity>

          <Text style={appStyles.mobileHeaderTitle}>Maintenance System</Text>
        </View>

        <View style={appStyles.mobileHeaderRight}>
          <TouchableOpacity
            style={appStyles.mobileHeaderIconBtn}
            onPress={() => setNotificationsVisible(true)}
          >
            <Text style={appStyles.mobileHeaderIconText}>🔔</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={appStyles.mobileLogoutBtn}
            onPress={handleLogout}
          >
            <Text style={appStyles.mobileLogoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
      >
        <Pressable
          style={appStyles.mobileMenuOverlay}
          onPress={() => setMenuVisible(false)}
        >
          <Pressable
            style={appStyles.mobileMenuSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={appStyles.mobileMenuTitle}>Menu</Text>

            {menuItems.map((item) => (
              <TouchableOpacity
                key={item.screen}
                style={appStyles.mobileMenuItem}
                onPress={() => handleNavigate(item.screen)}
              >
                <Text style={appStyles.mobileMenuItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </Pressable>
        </Pressable>
      </Modal>

      <Modal
        visible={notificationsVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setNotificationsVisible(false)}
      >
        <Pressable
          style={appStyles.mobileMenuOverlay}
          onPress={() => setNotificationsVisible(false)}
        >
          <Pressable
            style={appStyles.mobileNotificationBox}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={appStyles.messageTitle}>Notifications</Text>
            <Text style={appStyles.messageBody}>No notifications yet.</Text>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export default Header;