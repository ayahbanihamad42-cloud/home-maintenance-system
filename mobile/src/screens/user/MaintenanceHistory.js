import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const MaintenanceHistory = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : {};
      try {
        const res = await API.get(`/maintenance/user/${user.id}`);
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch {
        setRequests([]);
      }
    };
    load();
  }, []);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return requests.filter((r) =>
      [r.service, r.status, r.description, r.technician_name, r.city]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [requests, search]);

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="History" />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Maintenance History</Text>
          <Text style={appStyles.heroSubtitle}>Track and review your requests.</Text>
        </View>

        <View style={appStyles.card}>
          <TextInput
            style={appStyles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Search requests..."
          />
        </View>

        {filtered.map((r) => (
          <View style={appStyles.card} key={r.id}>
            <View style={appStyles.between}>
              <Text style={appStyles.sectionTitle}>{r.service}</Text>
              <View style={appStyles.statusBadge}>
                <Text style={appStyles.statusText}>{r.status}</Text>
              </View>
            </View>

            <Text style={appStyles.text}>Technician: {r.technician_name || "-"}</Text>
            <Text style={appStyles.text}>Date: {String(r.scheduled_date || "").slice(0, 10)}</Text>
            <Text style={appStyles.text}>Time: {String(r.scheduled_time || "").slice(0, 8)}</Text>
            <Text style={appStyles.text}>Payment: {r.payment_method || "-"}</Text>

            <TouchableOpacity
              style={appStyles.primaryBtn}
              onPress={() => navigation.navigate("Review", { requestId: r.id })}
            >
              <Text style={appStyles.primaryBtnText}>View Details</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
};

export default MaintenanceHistory;