import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "../../components/Common/Header";

export default function TechnicianDashboard({ navigation, route }) {
  const routeUser = route?.params?.user || {};
  const [user, setUser] = useState(routeUser);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const rawUser = await AsyncStorage.getItem("user");
      const storedUser = rawUser ? JSON.parse(rawUser) : {};

      const finalUser = routeUser?.id ? routeUser : storedUser;
      setUser(finalUser || {});
    } catch (err) {
      console.log("dashboard user load error:", err.message);
    }
  };

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Technician Dashboard</Text>
        <Text style={styles.subtitle}>Manage your work and requests</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate("TechnicianAvailability", {
              user,
            })
          }
        >
          <Text style={styles.cardTitle}>Availability</Text>
          <Text style={styles.cardText}>Add your available dates and times.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate("TechnicianRequests", {
              user,
            })
          }
        >
          <Text style={styles.cardTitle}>Requests</Text>
          <Text style={styles.cardText}>View and manage customer requests.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() =>
            navigation.navigate("UserProfile", {
              user,
              openGallery: true,
            })
          }
        >
          <Text style={styles.cardTitle}>Work Gallery</Text>
          <Text style={styles.cardText}>
            Open your profile and manage gallery posts.
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E7DCCC",
  },
  container: {
    padding: 24,
    paddingBottom: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    marginBottom: 10,
    color: "#111",
  },
  subtitle: {
    fontSize: 23,
    color: "#6B5E55",
    marginBottom: 28,
  },
  card: {
    backgroundColor: "#FFFAF4",
    borderRadius: 28,
    padding: 30,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    marginBottom: 22,
  },
  cardTitle: {
    fontSize: 34,
    fontWeight: "900",
    marginBottom: 16,
    color: "#111",
  },
  cardText: {
    fontSize: 22,
    color: "#3D342D",
    lineHeight: 32,
  },
});