import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";

import Header from "../../components/Common/Header";

function TechnicianDashboard() {
  const navigation = useNavigation();

  return (
    <>
      <Header />

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Technician Dashboard</Text>

        <View style={styles.panel}>
          <View style={styles.dashboardGrid}>
            <View style={styles.dashboardCard}>
              <Text style={styles.cardTitle}>Assigned Requests</Text>
              <Text style={styles.cardText}>Track and manage current requests.</Text>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate("TechnicianRequests")}
                >
                  <Text style={styles.buttonText}>View Requests</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.dashboardCard}>
              <Text style={styles.cardTitle}>Availability</Text>
              <Text style={styles.cardText}>Set your working hours for new bookings.</Text>

              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate("TechnicianAvailability")}
                >
                  <Text style={styles.buttonText}>Set Availability</Text>
                </TouchableOpacity>
              </View>
            </View>
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
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111",
  },
  panel: {
    backgroundColor: "#FFF9F3",
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  dashboardGrid: {
    gap: 15,
  },
  dashboardCard: {
    width: "100%",
    backgroundColor: "#F8F1E8",
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
  },
  cardText: {
    fontSize: 14,
    marginBottom: 10,
  },
  cardActions: {
    marginTop: 5,
  },
  button: {
    backgroundColor: "#111",
    paddingVertical: 10,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
});

export default TechnicianDashboard;