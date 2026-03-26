import React from "react";
import { View, Text, Pressable } from "react-native";

function TechnicianCard({ technician, navigation }) {

  return (
    <View style={{ padding: 15, margin: 10, borderWidth: 1, borderRadius: 10 }}>

      <Text style={{ fontSize: 18, fontWeight: "bold" }}>{technician.name}</Text>
      <Text>{technician.service}</Text>
      <Text>{technician.experience} years</Text>

      <Pressable
        onPress={() => navigation.navigate("Request", { id: technician.technicianId })}
        style={{ marginTop: 10, backgroundColor: "#007bff", padding: 10 }}
      >
        <Text style={{ color: "#fff" }}>Booking</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("TechnicianProfile", { id: technician.technicianId })}
        style={{ marginTop: 10, backgroundColor: "gray", padding: 10 }}
      >
        <Text style={{ color: "#fff" }}>View Profile</Text>
      </Pressable>

    </View>
  );
}

export default TechnicianCard;