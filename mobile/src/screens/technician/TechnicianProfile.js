import React, { useEffect, useState } from "react";
import { View, Text, Button, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useRoute, useNavigation } from "@react-navigation/native";

import API from "../../services/api";
import Header from "../../components/Common/Header";

function TechnicianProfile() {
  const route = useRoute();
  const navigation = useNavigation();
  const { technicianId } = route.params || {};

  const [tech, setTech] = useState(null);

  useEffect(() => {
    if (!technicianId) return;

    API.get(`/technicians/${technicianId}`)
      .then((res) => setTech(res.data))
      .catch((err) => console.error(err));
  }, [technicianId]);

  if (!tech) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.name}>{tech.name}</Text>
          <Text style={styles.specialty}>{tech.service} Specialist</Text>

          <View style={styles.stats}>
            <Text style={styles.statItem}>
              <Text style={styles.bold}>Experience: </Text>
              {tech.experience} Years
            </Text>
            <Text style={styles.statItem}>
              <Text style={styles.bold}>Rating: </Text>
              ⭐ {Number(tech.rating || 0).toFixed(1)}
            </Text>
          </View>

          <View style={styles.contact}>
            <Text><Text style={styles.bold}>City: </Text>{tech.city || "Not provided"}</Text>
            <Text><Text style={styles.bold}>Phone: </Text>{tech.phone || "Not provided"}</Text>
            <Text><Text style={styles.bold}>Email: </Text>{tech.email || "Not provided"}</Text>
          </View>

          <Text style={styles.bio}>
            {tech.bio || "Experienced technician ready to help."}
          </Text>

          <View style={styles.actions}>
            <Button
              title="Send Message"
              onPress={() => navigation.navigate("Chat", { userId: tech.user_id })}
              color="#007BFF"
            />
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#E8DCCF",
    flexGrow: 1,
  },
  card: {
    backgroundColor: "#FFF9F3",
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  name: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 5,
  },
  specialty: {
    fontSize: 16,
    color: "#555",
    marginBottom: 15,
  },
  stats: {
    marginBottom: 15,
  },
  statItem: {
    fontSize: 14,
    marginBottom: 5,
  },
  bold: {
    fontWeight: "bold",
  },
  contact: {
    marginBottom: 15,
    gap: 6,
  },
  bio: {
    fontSize: 14,
    marginBottom: 15,
    color: "#444",
  },
  actions: {
    alignItems: "flex-start",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default TechnicianProfile;