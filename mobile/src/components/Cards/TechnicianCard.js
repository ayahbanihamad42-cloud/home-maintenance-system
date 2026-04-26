import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

function TechnicianCard({ technician }) {
  const navigation = useNavigation();

  return (
    <View style={{ padding: 15, margin: 10, borderWidth: 1, borderRadius: 10 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        {technician.name}
      </Text>

      <Text>{technician.service}</Text>
      <Text>{technician.experience} years</Text>

      <Pressable
        onPress={() =>
          navigation.navigate("MaintenanceRequest", {
            technicianId: technician.technicianId,
          })
        }
        style={{ marginTop: 10, backgroundColor: "#007bff", padding: 10 }}
      >
        <Text style={{ color: "#fff" }}>Booking</Text>
      </Pressable>

      <Pressable
        onPress={() =>
          navigation.navigate("TechnicianProfile", {
            technicianId: technician.technicianId,
          })
        }
        style={{ marginTop: 10, backgroundColor: "gray", padding: 10 }}
      >
        <Text style={{ color: "#fff" }}>View Profile</Text>
      </Pressable>
    </View>
  );
}

export default TechnicianCard;