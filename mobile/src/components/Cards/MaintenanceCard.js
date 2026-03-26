import React from "react";
import { View, Text, Pressable } from "react-native";

function MaintenanceCard({ request, rating, navigation }) {

  return (
    <View style={{ padding: 15, margin: 10, borderWidth: 1, borderRadius: 10 }}>
      
      {/* Service name */}
      <Text style={{ color: '#007bff', fontSize: 18, fontWeight: "bold" }}>
        {request.service}
      </Text>

      {/* Request status */}
      <Text style={{ marginVertical: 15, fontWeight: "bold" }}>
        Status:{" "}
        <Text style={{ color: request.status === 'completed' ? 'green' : 'orange' }}>
          {request.status}
        </Text>
      </Text>

      {/* Rating display */}
      {rating ? (
        <Text><Text style={{ fontWeight: "bold" }}>Rating:</Text> {rating.rating} ⭐</Text>
      ) : (
        <Text><Text style={{ fontWeight: "bold" }}>Rating:</Text> Not submitted</Text>
      )}

      {/* Navigate to review */}
      <Pressable
        onPress={() => navigation.navigate("Review", { id: request.id })}
        style={{ marginTop: 10, backgroundColor: "#007bff", padding: 10 }}
      >
        <Text style={{ color: "#fff" }}>View Details</Text>
      </Pressable>

    </View>
  );
}

export default MaintenanceCard;