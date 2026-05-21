import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

export default function TechnicianDashboard({ navigation, route }) {
  const user = route?.params?.user || {};

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Technician Dashboard</Text>
        <Text style={styles.subtitle}>Manage your work and requests</Text>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("TechnicianAvailability", { user })}
        >
          <Text style={styles.cardTitle}>Availability</Text>
          <Text style={styles.cardText}>Add your available dates and times.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("TechnicianRequests", { user })}
        >
          <Text style={styles.cardTitle}>Requests</Text>
          <Text style={styles.cardText}>View and manage customer requests.</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => navigation.navigate("TechnicianProfile", { user })}
        >
          <Text style={styles.cardTitle}>Work Gallery</Text>
          <Text style={styles.cardText}>Open your profile and manage gallery posts.</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

function Header({ navigation }) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>Maintenance System</Text>
      <TouchableOpacity style={styles.bell}>
        <Text style={styles.bellText}>🔔</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>
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
  },
  headerTitle: { flex: 1, fontSize: 26, fontWeight: "900" },
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
  container: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 42, fontWeight: "900", marginBottom: 10 },
  subtitle: { fontSize: 23, color: "#6b5e55", marginBottom: 28 },
  card: {
    backgroundColor: "#fffaf4",
    borderRadius: 28,
    padding: 30,
    borderWidth: 1,
    borderColor: "#d8c8b8",
    marginBottom: 22,
  },
  cardTitle: { fontSize: 34, fontWeight: "900", marginBottom: 16 },
  cardText: { fontSize: 22, color: "#3d342d", lineHeight: 32 },
});