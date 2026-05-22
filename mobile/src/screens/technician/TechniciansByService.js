import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Header from "../../components/Common/Header";
import API from "../../services/api";
import CustomDropdown from "../../components/Common/CustomDropdown";

export default function TechniciansByService({ route, navigation }) {
  const service = route?.params?.service || route?.params?.serviceName || "";

  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [resultType, setResultType] = useState("technicians");
  const [priceFilter, setPriceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const loadTechnicians = async () => {
    try {
      setLoading(true);
      const safeService = encodeURIComponent(String(service).trim());
      const res = await API.get(`/technicians/service/${safeService}`);
      setTechnicians(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("technicians error:", err?.response?.data || err.message);
      setTechnicians([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTechnicians();
  }, [service]);

  const cities = useMemo(() => {
    const result = [];
    technicians.forEach((t) => {
      const city = String(t.city || "").trim();
      if (city && !result.includes(city)) result.push(city);
    });
    return result;
  }, [technicians]);

  const filteredTechnicians = useMemo(() => {
    if (resultType === "stores") return [];

    let result = [...technicians];

    const q = search.trim().toLowerCase();

    if (q) {
      result = result.filter((t) => {
        const combined = `${t.name || ""} ${t.service || ""} ${t.city || ""}`.toLowerCase();
        return combined.includes(q);
      });
    }

    if (priceFilter === "low") {
      result = result.filter((t) => Number(t.price_per_hour || 0) <= 10);
    }

    if (priceFilter === "mid") {
      result = result.filter(
        (t) =>
          Number(t.price_per_hour || 0) > 10 &&
          Number(t.price_per_hour || 0) <= 25
      );
    }

    if (priceFilter === "high") {
      result = result.filter((t) => Number(t.price_per_hour || 0) > 25);
    }

    if (locationFilter !== "all") {
      result = result.filter(
        (t) => String(t.city || "").toLowerCase() === locationFilter.toLowerCase()
      );
    }

    if (ratingFilter !== "all") {
      result = result.filter((t) => Number(t.rating || 0) >= Number(ratingFilter));
    }

    return result;
  }, [technicians, search, resultType, priceFilter, locationFilter, ratingFilter]);

  const getTechnicianId = (tech) =>
    tech.technicianId || tech.technician_id || tech.id;

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.panel}>
          <Text style={styles.title}>{service} Technicians</Text>

          <TextInput
            style={styles.search}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, service or location..."
            placeholderTextColor="#8B7D70"
          />

          <View style={styles.filterGrid}>
            <View style={styles.filterItem}>
              <CustomDropdown
                value={resultType}
                onChange={setResultType}
                options={[
                  { label: "Technicians", value: "technicians" },
                  { label: "Stores", value: "stores" },
                ]}
              />
            </View>

            <View style={styles.filterItem}>
              <CustomDropdown
                value={priceFilter}
                onChange={setPriceFilter}
                options={[
                  { label: "All prices", value: "all" },
                  { label: "Low", value: "low" },
                  { label: "Medium", value: "mid" },
                  { label: "High", value: "high" },
                ]}
              />
            </View>

            <View style={styles.filterItem}>
              <CustomDropdown
                value={locationFilter}
                onChange={setLocationFilter}
                options={[
                  { label: "All locations", value: "all" },
                  ...cities.map((city) => ({ label: city, value: city })),
                ]}
              />
            </View>

            <View style={styles.filterItem}>
              <CustomDropdown
                value={ratingFilter}
                onChange={setRatingFilter}
                options={[
                  { label: "All ratings", value: "all" },
                  { label: "5+", value: "5" },
                  { label: "4+", value: "4" },
                  { label: "3+", value: "3" },
                ]}
              />
            </View>
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#111" style={{ marginTop: 30 }} />
          ) : resultType === "stores" ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Store results will be connected later.</Text>
            </View>
          ) : filteredTechnicians.length === 0 ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>No technicians found.</Text>
            </View>
          ) : (
            filteredTechnicians.map((tech) => {
              const technicianId = getTechnicianId(tech);

              return (
                <View key={technicianId} style={styles.card}>
                  <Text style={styles.techName}>{tech.name || "Technician"}</Text>
                  <Text style={styles.techService}>{tech.service || service}</Text>

                  <Text style={styles.info}>City: {tech.city || "-"}</Text>
                  <Text style={styles.info}>Phone: {tech.phone || "-"}</Text>
                  <Text style={styles.info}>
                    Experience: {tech.experience || 0} years
                  </Text>
                  <Text style={styles.info}>
                    Price: {Number(tech.price_per_hour || 0).toFixed(2)} JOD/hour
                  </Text>
                  <Text style={styles.info}>
                    Rating: ⭐ {Number(tech.rating || 0).toFixed(1)}
                  </Text>
                  <Text style={styles.bio}>
                    {tech.bio || "Experienced technician ready to help."}
                  </Text>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() =>
                        navigation.navigate("TechnicianProfile", {
                          technicianId,
                          tech,
                        })
                      }
                    >
                      <Text style={styles.primaryText}>View Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() =>
                        navigation.navigate("MaintenanceRequest", {
                          technicianId,
                          technicianName: tech.name,
                          service: tech.service || service,
                          price_per_hour: tech.price_per_hour || 0,
                          tech,
                        })
                      }
                    >
                      <Text style={styles.primaryText}>Book Now</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E7DCCC" },
  container: { padding: 24, paddingBottom: 80 },
  panel: {
    backgroundColor: "#FFFAF4",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 30,
    padding: 24,
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#111",
    marginBottom: 24,
  },
  search: {
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 999,
    height: 58,
    paddingHorizontal: 20,
    fontSize: 17,
    marginBottom: 18,
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 22,
  },
  filterItem: { width: "48%" },
  emptyCard: {
    marginTop: 20,
    backgroundColor: "#FFFAF4",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 24,
    padding: 28,
  },
  emptyText: { textAlign: "center", fontSize: 18, color: "#4D433B" },
  card: {
    backgroundColor: "#FFFAF4",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 28,
    padding: 24,
    marginTop: 20,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 5,
  },
  techName: { fontSize: 34, fontWeight: "900", color: "#111" },
  techService: { fontSize: 25, color: "#111", marginTop: 8, marginBottom: 16 },
  info: { fontSize: 20, color: "#111", marginTop: 7 },
  bio: { fontSize: 19, color: "#111", marginTop: 16, lineHeight: 28 },
  actions: { marginTop: 22, gap: 14 },
  primaryBtn: {
    backgroundColor: "#111",
    borderRadius: 22,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#fff", fontSize: 18, fontWeight: "900" },
});