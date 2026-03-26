import React, { useEffect, useState } from "react";
import { View, Text, Pressable, ScrollView } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getNotifications } from "../../services/notificationService.jsx";

function Header({ navigation }) {

  const [user, setUser] = useState(null);
  const role = user?.role;

  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationFeed, setNotificationFeed] = useState([]);
  const [latestChatUserId, setLatestChatUserId] = useState(null);

  // 🔥 بدل localStorage
  useEffect(() => {
    const loadUser = async () => {
      const data = await AsyncStorage.getItem("user");
      setUser(data ? JSON.parse(data) : null);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await AsyncStorage.clear();
    navigation.navigate("Login");
  };

  useEffect(() => {
    if (!user) return;

    const req = getNotifications();

    if (!req || typeof req.then !== "function") {
      setNotificationFeed([]);
      return;
    }

    req
      .then((res) => {
        const feed = res?.data || [];
        setNotificationFeed(feed);

        const latestMessage = feed.find(
          (item) => item.type === "message" && item.chatUserId
        );
        setLatestChatUserId(latestMessage?.chatUserId || null);
      })
      .catch(() => setNotificationFeed([]));
  }, [user]);

  return (
    <View>

      <Text>Maintenance System</Text>

      {user ? (
        <>
          <View>

            {role === "technician" ? (
              <>
                <Pressable onPress={() => navigation.navigate("TechnicianDashboard")}>
                  <Text>Dashboard</Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate("TechnicianRequests")}>
                  <Text>Requests</Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate("Availability")}>
                  <Text>Availability</Text>
                </Pressable>

                {latestChatUserId ? (
                  <Pressable onPress={() => navigation.navigate("Chat", { id: latestChatUserId })}>
                    <Text>Chat</Text>
                  </Pressable>
                ) : (
                  <Pressable onPress={() => alert("No chats yet")}>
                    <Text>Chat</Text>
                  </Pressable>
                )}
              </>
            ) : (
              <>
                <Pressable onPress={() => navigation.navigate("Home")}>
                  <Text>Home</Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate("History")}>
                  <Text>Requests History</Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate("Profile")}>
                  <Text>Profile</Text>
                </Pressable>

                <Pressable onPress={() => navigation.navigate("AIChat")}>
                  <Text>AI Assistant</Text>
                </Pressable>
              </>
            )}

          </View>

          <View>

            <Pressable onPress={() => setShowNotifications(prev => !prev)}>
              <Text>🔔</Text>
            </Pressable>

            {showNotifications ? (
              <View>

                <Text>Notifications</Text>

                {notificationFeed.length === 0 ? (
                  <Text>No notifications yet.</Text>
                ) : (
                  <ScrollView>
                    {notificationFeed.map((item) => (
                      <Pressable
                        key={item.id}
                        onPress={() => {
                          setShowNotifications(false);

                          if (item.type === "message" && item.chatUserId) {
                            navigation.navigate("Chat", { id: item.chatUserId });
                          } else if (item.type === "request") {
                            if (role === "technician") {
                              navigation.navigate("TechnicianRequests");
                            } else if (item.requestId) {
                              navigation.navigate("Review", { id: item.requestId });
                            }
                          }
                        }}
                      >
                        <Text>{item.title}</Text>
                        <Text>{item.body}</Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                )}

              </View>
            ) : null}

            <Pressable onPress={handleLogout}>
              <Text>Log Out</Text>
            </Pressable>

          </View>
        </>
      ) : (
        <Text>Welcome to our Home Maintenance System</Text>
      )}

    </View>
  );
}

export default Header;