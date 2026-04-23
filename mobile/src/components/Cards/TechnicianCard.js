import React from "react";
import { View, Text, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";

function TechnicianCard({ technician }) {

  const navigation = useNavigation(); // 🔥 الحل

  return (
    <View style={{ padding: 15, margin: 10, borderWidth: 1, borderRadius: 10 }}>

      <Text style={{ fontSize: 18, fontWeight: "bold" }}>
        {technician.name}
      </Text>

      <Text>{technician.service}</Text>
      <Text>{technician.experience} years</Text>

      {/* Booking */}
      <Pressable
        onPress={() =>
          navigation.navigate("Request", {
            technicianId: technician.technicianId // ✅ مهم جداً
          })
        }
        style={{ marginTop: 10, backgroundColor: "#007bff", padding: 10 }}
      >
        <Text style={{ color: "#fff" }}>Booking</Text>
      </Pressable>

      {/* Profile */}
      <Pressable
        onPress={() =>
          navigation.navigate("TechnicianProfile", {
            technicianId: technician.technicianId // ✅ نفس الشي
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