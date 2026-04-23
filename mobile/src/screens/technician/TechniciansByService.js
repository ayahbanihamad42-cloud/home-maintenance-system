import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

import TechnicianCard from "../../components/Cards/TechnicianCard";
import StoreCard from "../../components/Cards/StoreCard";

import { getTechnicians } from "../../services/technicianService";
import { getStoresByService } from "../../services/storeService";
import Header from "../../components/Common/Header";

export default function TechniciansByService() {
  const route = useRoute();
  const { service } = route.params || {};

  const [technicians, setTechnicians] = useState([]);
  const [stores, setStores] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!service) return;

    setLoading(true);

    Promise.all([getTechnicians(service), getStoresByService(service)])
      .then(([techs, storeList]) => {
        setTechnicians(techs || []);
        setStores(storeList || []);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setTechnicians([]);
        setStores([]);
      })
      .finally(() => setLoading(false));
  }, [service]);

  const list =
    filter === "store"
      ? stores
      : filter === "technician"
      ? technicians
      : [...technicians, ...stores];

  const renderItem = ({ item }) => {
    if ("technicianId" in item) {
      return <TechnicianCard technician={item} />;
    }
    return <StoreCard store={item} />;
  };

  return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.title}>{service} Options</Text>

      <Picker
        selectedValue={filter}
        onValueChange={(value) => setFilter(value)}
        style={styles.picker}
      >
        <Picker.Item label="All" value="all" />
        <Picker.Item label="Technicians" value="technician" />
        <Picker.Item label="Stores" value="store" />
      </Picker>

      {loading ? (
        <ActivityIndicator size="large" color="#0000ff" />
      ) : list.length === 0 ? (
        <Text style={styles.message}>No {service} options found.</Text>
      ) : (
        <FlatList
          data={list}
          renderItem={renderItem}
          keyExtractor={(item) =>
            "technicianId" in item
              ? item.technicianId.toString()
              : item.storeId.toString()
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#E8DCCF" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16, color: "#111" },
  picker: {
    marginBottom: 16,
    backgroundColor: "#FFF9F3",
    borderRadius: 12,
  },
  message: { textAlign: "center", marginTop: 20, fontSize: 16 },
  list: { paddingBottom: 20 },
});