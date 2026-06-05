import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import CustomDropdown from "../../components/Common/CustomDropdown";
import API from "../../services/api";
import appStyles, { colors } from "../../styles/mobileStyles";

const cityOptions = [
  { label: "All Jordan cities", value: "all" },
  { label: "Amman", value: "Amman" },
  { label: "Irbid", value: "Irbid" },
  { label: "Zarqa", value: "Zarqa" },
  { label: "Aqaba", value: "Aqaba" },
  { label: "Mafraq", value: "Mafraq" },
  { label: "Jerash", value: "Jerash" },
  { label: "Ajloun", value: "Ajloun" },
  { label: "Madaba", value: "Madaba" },
  { label: "Karak", value: "Karak" },
  { label: "Tafilah", value: "Tafilah" },
  { label: "Maan", value: "Maan" },
  { label: "Balqa", value: "Balqa" },
];

const ratingOptions = [
  { label: "All ratings", value: "all" },
  { label: "1+ stars", value: "1" },
  { label: "2+ stars", value: "2" },
  { label: "3+ stars", value: "3" },
  { label: "4+ stars", value: "4" },
  { label: "5 stars", value: "5" },
];

function TechniciansByService({ route, navigation }) {
  const service = route?.params?.service || "";
  const [technicians, setTechnicians] = useState([]);
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const load = async () => {
    try {
      setMessage("");
      const res = await API.get(`/technicians/service/${service}`);
      setTechnicians(Array.isArray(res.data) ? res.data : []);
    } catch {
      setTechnicians([]);
      setMessage("Failed to load technicians.");
    }
  };

  useEffect(() => {
    load();
  }, [service]);

  const filtered = useMemo(() => {
    let result = [...technicians];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((t) =>
        [t.name, t.city, t.service, t.phone, t.email]
          .join(" ")
          .toLowerCase()
          .includes(q)
      );
    }

    if (cityFilter !== "all") {
      result = result.filter(
        (t) => String(t.city || "").toLowerCase() === cityFilter.toLowerCase()
      );
    }

    if (ratingFilter !== "all") {
      result = result.filter(
        (t) => Number(t.rating || 0) >= Number(ratingFilter)
      );
    }

    return result;
  }, [technicians, search, cityFilter, ratingFilter]);

  const clearFilters = () => {
    setSearch("");
    setCityFilter("all");
    setRatingFilter("all");
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Technicians" />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <HeroSection
          title={`${service} Technicians`}
          subtitle="Choose a technician, filter by city or rating, and book your request."
        />

        {message ? (
          <View style={appStyles.errorBox}>
            <Text style={appStyles.errorText}>{message}</Text>
          </View>
        ) : null}

        <View style={styles.filterBox}>
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search by name, city, phone..."
            placeholderTextColor={colors.muted}
          />

          <View style={styles.filterRow}>
            <View style={styles.filterHalf}>
              <CustomDropdown
                label="City"
                value={cityFilter}
                options={cityOptions}
                onChange={setCityFilter}
              />
            </View>

            <View style={styles.filterHalf}>
              <CustomDropdown
                label="Rating"
                value={ratingFilter}
                options={ratingOptions}
                onChange={setRatingFilter}
              />
            </View>
          </View>

          <TouchableOpacity style={styles.clearSmallBtn} onPress={clearFilters}>
            <Text style={styles.clearSmallText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>

        {filtered.length === 0 ? (
          <View style={appStyles.card}>
            <Text style={appStyles.sectionTitle}>No technicians found</Text>
          </View>
        ) : (
          filtered.map((tech) => (
            <View style={appStyles.card} key={tech.id || tech.technicianId}>
              <View style={appStyles.between}>
                <Text style={appStyles.sectionTitle}>{tech.name || "-"}</Text>
                <View style={appStyles.statusBadge}>
                  <Text style={appStyles.statusText}>{tech.service || "-"}</Text>
                </View>
              </View>

              <Text style={appStyles.text}>
                Rating: ⭐ {Number(tech.rating || 0).toFixed(1)}
              </Text>
              <Text style={appStyles.text}>City: {tech.city || "-"}</Text>
              <Text style={appStyles.text}>Phone: {tech.phone || "-"}</Text>
              <Text style={appStyles.text}>
                Experience: {tech.experience || 0} years
              </Text>
              <Text style={appStyles.text}>
                Price: {Number(tech.price_per_hour || 0).toFixed(2)} JOD/hour
              </Text>

              <TouchableOpacity
                style={appStyles.primaryBtn}
                onPress={() =>
                  navigation.navigate("TechnicianProfile", {
                    technicianId: tech.technicianId || tech.id,
                  })
                }
              >
                <Text style={appStyles.primaryBtnText}>View Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={appStyles.secondaryBtn}
                onPress={() =>
                  navigation.navigate("MaintenanceRequest", {
                    technicianId: tech.technicianId || tech.id,
                    technicianName: tech.name,
                    service: tech.service,
                    price_per_hour: tech.price_per_hour,
                  })
                }
              >
                <Text style={appStyles.secondaryBtnText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterBox: {
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 12,
    marginBottom: 16,
  },
  searchInput: {
    height: 52,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 14,
    fontSize: 15,
    color: colors.text,
    marginBottom: 4,
  },
  filterRow: {
    flexDirection: "row",
    gap: 10,
  },
  filterHalf: {
    flex: 1,
  },
  clearSmallBtn: {
    alignSelf: "flex-end",
    paddingVertical: 8,
    paddingHorizontal: 10,
  },
  clearSmallText: {
    color: colors.primary,
    fontWeight: "900",
  },
});

export default TechniciansByService;