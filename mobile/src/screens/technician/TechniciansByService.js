import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const TechniciansByService = ({ route, navigation }) => {
  const service = route?.params?.service || "";
  const [technicians, setTechnicians] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/technicians/service/${service}`);
        setTechnicians(Array.isArray(res.data) ? res.data : []);
      } catch {
        setTechnicians([]);
      }
    };
    load();
  }, [service]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return technicians.filter((t) =>
      [t.name, t.city, t.phone, t.service, t.experience]
        .join(" ")
        .toLowerCase()
        .includes(q)
    );
  }, [technicians, search]);

  const getTechId = (t) => t.technician_id || t.id || t.user_id;

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title={service} />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>{service} Technicians</Text>
          <Text style={appStyles.heroSubtitle}>Search and book trusted technicians.</Text>
        </View>

        <View style={appStyles.card}>
          <TextInput
            style={appStyles.input}
            value={search}
            onChangeText={setSearch}
            placeholder="Smart search..."
          />
        </View>

        {filtered.map((tech) => {
          const techId = getTechId(tech);

          return (
            <View style={appStyles.card} key={techId}>
              <View style={appStyles.between}>
                <Text style={appStyles.sectionTitle}>{tech.name || "Technician"}</Text>
                <View style={appStyles.statusBadge}>
                  <Text style={appStyles.statusText}>⭐ {Number(tech.rating || tech.avg_rating || 0).toFixed(1)}</Text>
                </View>
              </View>

              <Text style={appStyles.text}>Service: {tech.service || service}</Text>
              <Text style={appStyles.text}>City: {tech.city || "-"}</Text>
              <Text style={appStyles.text}>Phone: {tech.phone || "-"}</Text>
              <Text style={appStyles.text}>Experience: {tech.experience || 0} years</Text>

              <TouchableOpacity
                style={appStyles.primaryBtn}
                onPress={() => navigation.navigate("TechnicianProfile", { technicianId: techId })}
              >
                <Text style={appStyles.primaryBtnText}>View Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={appStyles.secondaryBtn}
                onPress={() =>
                  navigation.navigate("MaintenanceRequest", {
                    technician: tech,
                    technicianId: techId,
                    service,
                  })
                }
              >
                <Text style={appStyles.secondaryBtnText}>Booking</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
};

export default TechniciansByService;