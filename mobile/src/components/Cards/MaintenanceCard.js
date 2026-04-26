import React from "react";
import { View, Text, Pressable, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

function TechnicianCard({ technician }) {
  const navigation = useNavigation();

  if (!technician) return null;

  return (
    <View style={styles.card}>
      <Text style={styles.name}>{technician.name}</Text>
      <Text style={styles.info}>{technician.service}</Text>
      <Text style={styles.info}>{technician.experience} years</Text>

      <Pressable
        onPress={() =>
          navigation.navigate("MaintenanceRequest", {
            technicianId: technician.technicianId,
          })
        }
        style={styles.primaryBtn}
      >
        <Text style={styles.primaryBtnText}>Booking</Text>
      </Pressable>

      <Pressable
        onPress={() =>
          navigation.navigate("TechnicianProfile", {
            technicianId: technician.technicianId,
          })
        }
        style={styles.secondaryBtn}
      >
        <Text style={styles.secondaryBtnText}>View Profile</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: 15,
    marginVertical: 8,
    borderWidth: 1,
    borderRadius: 16,
    borderColor: "#D8C8B8",
    backgroundColor: "#FFF9F3",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#111",
    marginBottom: 6,
  },
  info: {
    fontSize: 14,
    color: "#444",
    marginBottom: 4,
  },
  primaryBtn: {
    marginTop: 12,
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#fff",
    fontWeight: "700",
  },
  secondaryBtn: {
    marginTop: 10,
    backgroundColor: "#ECE2D6",
    padding: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  secondaryBtnText: {
    color: "#111",
    fontWeight: "700",
  },
});

export default TechnicianCard;