import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";
import { useNavigation } from "@react-navigation/native";
// Navigation hook

import Header from "../../components/common/Header";
// Header component

// Technician dashboard main page
function TechnicianDashboard() {
  const navigation = useNavigation();

  return (
    <>
      {/* Page header */}
      <Header />

      <ScrollView style={styles.container}>
        {/* Page title */}
        <Text style={styles.title}>Technician Dashboard</Text>

        <View style={styles.panel}>
          {/* Dashboard cards grid */}
          <View style={styles.dashboardGrid}>

            {/* Assigned requests card */}
            <View style={styles.dashboardCard}>
              <Text style={styles.cardTitle}>Assigned Requests</Text>
              <Text style={styles.cardText}>Track and manage current requests.</Text>

              {/* Requests navigation */}
              <View style={styles.cardActions}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => navigation.navigate("TechnicianRequests")}
                >
                  <Text style={styles.buttonText}>View Requests</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Availability card */}
            <View style={styles.dashboardCard}>
              <Text style={styles.cardTitle}>Availability</Text>
              <Text style={styles.cardText}>Set your working hours for new bookings.</Text>

              {/* Availability navigation */}
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

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },
  panel: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
  },
  dashboardGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  dashboardCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
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
    backgroundColor: "#007BFF",
    paddingVertical: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
});

export default TechnicianDashboard;