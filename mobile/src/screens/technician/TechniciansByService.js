import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, Picker, StyleSheet } from "react-native";
import { useRoute } from "@react-navigation/native";

// مكونات البطاقات
import TechnicianCard from "../../components/cards/TechnicianCard";
import StoreCard from "../../components/cards/StoreCard";

// استدعاء API
import { getTechnicians } from "../../services/technicianService";
import { getStoresByService } from "../../services/storeService";

// الصفحة الرئيسية للفنيين والمتاجر حسب الخدمة
export default function TechniciansByService() {
  const route = useRoute();
  const { service } = route.params; // قراءة اسم الخدمة من params

  const [technicians, setTechnicians] = useState([]);
  const [stores, setStores] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // جلب البيانات عند تغيير الخدمة
  useEffect(() => {
    setLoading(true);

    Promise.all([
      getTechnicians(service),
      getStoresByService(service)
    ])
      .then(([techs, storeList]) => {
        setTechnicians(techs);
        setStores(storeList);
      })
      .catch((err) => {
        console.error("Error fetching data:", err);
        setTechnicians([]);
        setStores([]);
      })
      .finally(() => setLoading(false));
  }, [service]);

  // بناء القائمة حسب الفلترة
  const list =
    filter === "store"
      ? stores
      : filter === "technician"
      ? technicians
      : [...technicians, ...stores];

  // Render عنصر واحد (فني أو متجر)
  const renderItem = ({ item }) => {
    if ("technicianId" in item) {
      return <TechnicianCard technician={item} />;
    } else {
      return <StoreCard store={item} />;
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{service} Options</Text>

      {/* Picker للفلترة */}
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
            "technicianId" in item ? item.technicianId.toString() : item.storeId.toString()
          }
          contentContainerStyle={styles.list}
        />
      )}
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#fff" },
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 16 },
  picker: { height: 50, width: "100%", marginBottom: 16 },
  message: { textAlign: "center", marginTop: 20, fontSize: 16 },
  list: { paddingBottom: 20 },
});