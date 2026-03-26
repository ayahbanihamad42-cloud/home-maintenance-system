import React from "react";
import { View, Text, Pressable } from "react-native";

function StoreCard({ store, navigation }) {

  return (
    <View style={{ padding: 15, margin: 10, borderWidth: 1, borderRadius: 10 }}>

      <Text style={{ fontSize: 18, fontWeight: "bold" }}>{store.name}</Text>
      <Text>{store.service}</Text>
      <Text>{store.city}</Text>
      <Text>{store.address}</Text>

      <Pressable
        onPress={() => navigation.navigate("Request", { id: store.storeId })}
        style={{ marginTop: 10, backgroundColor: "#007bff", padding: 10 }}
      >
        <Text style={{ color: "#fff" }}>Booking</Text>
      </Pressable>

      <Pressable
        onPress={() => navigation.navigate("StoreProfile", { id: store.storeId })}
        style={{ marginTop: 10, backgroundColor: "gray", padding: 10 }}
      >
        <Text style={{ color: "#fff" }}>View Profile</Text>
      </Pressable>

    </View>
  );
}

export default StoreCard;