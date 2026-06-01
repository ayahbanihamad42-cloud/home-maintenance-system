import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const AdminDashboard = ({ navigation }) => {
  const [active, setActive] = useState("users");
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [services, setServices] = useState([]);

  const load = async () => {
    try {
      const u = await API.get("/admin/users");
      setUsers(Array.isArray(u.data) ? u.data : []);
    } catch {}

    try {
      const t = await API.get("/admin/technicians");
      setTechnicians(Array.isArray(t.data) ? t.data : []);
    } catch {}

    try {
      const s = await API.get("/admin/services");
      setServices(Array.isArray(s.data) ? s.data : []);
    } catch {}
  };

  useEffect(() => {
    load();
  }, []);

  const data = active === "users" ? users : active === "technicians" ? technicians : services;

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Admin" />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Admin Dashboard</Text>
          <Text style={appStyles.heroSubtitle}>Manage users, technicians, and services.</Text>
        </View>

        <View style={appStyles.row}>
          {["users", "technicians", "services"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[active === tab ? appStyles.primaryBtn : appStyles.secondaryBtn, { flex: 1 }]}
              onPress={() => setActive(tab)}
            >
              <Text style={active === tab ? appStyles.primaryBtnText : appStyles.secondaryBtnText}>
                {tab}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {data.map((item) => (
          <View style={appStyles.card} key={item.id || item.technician_id || item.name}>
            <Text style={appStyles.sectionTitle}>{item.name || item.service_name || item.title}</Text>
            <Text style={appStyles.text}>Email: {item.email || "-"}</Text>
            <Text style={appStyles.text}>Phone: {item.phone || "-"}</Text>
            <Text style={appStyles.text}>City: {item.city || "-"}</Text>
            <Text style={appStyles.text}>Role: {item.role || active}</Text>
          </View>
        ))}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
};

export default AdminDashboard;