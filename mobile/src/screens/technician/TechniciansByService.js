import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "../../components/Common/Header";
import API from "../../services/api";
import CustomDropdown from "../../components/Common/CustomDropdown";
import {
  getTechnicians,
  smartSearchTechnicians,
} from "../../services/technicianService";

const jordanCities = [
  "Amman",
  "Irbid",
  "Zarqa",
  "Aqaba",
  "Salt",
  "Madaba",
  "Karak",
  "Mafraq",
  "Jerash",
  "Ajloun",
  "Tafilah",
  "Maan",
  "Ramtha",
  "Russeifa",
];

const getTechnicianId = (tech) =>
  tech.technicianId || tech.technician_id || tech.tech_id || tech.id;

const normalizeText = (value) => String(value || "").trim().toLowerCase();
const getRating = (tech) => Number(tech.rating || tech.average_rating || 0);
const getPrice = (tech) => Number(tech.price_per_hour || 0);

function CommentsModal({ visible, onClose, technicianId }) {
  const [comments, setComments] = useState([]);

  const loadComments = async () => {
    if (!visible || !technicianId) return;

    try {
      const res = await API.get(`/ratings/technician/${technicianId}`);
      setComments(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("comments error:", err?.response?.data || err.message);
      setComments([]);
    }
  };

  useEffect(() => {
    loadComments();
  }, [visible, technicianId]);

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.commentsModal}>
          <Text style={styles.commentsTitle}>Comments</Text>

          {comments.length === 0 ? (
            <Text style={styles.noComments}>No comments yet.</Text>
          ) : (
            <ScrollView style={{ maxHeight: 360 }}>
              {comments.map((item) => (
                <View key={item.id} style={styles.commentRow}>
                  <View style={styles.commentTop}>
                    <Text style={styles.commentUser}>
                      {item.user_name || "User"}
                    </Text>
                    <Text style={styles.commentRating}>⭐ {item.rating}</Text>
                  </View>

                  <Text style={styles.commentText}>
                    {item.comment || "No comment."}
                  </Text>
                </View>
              ))}
            </ScrollView>
          )}

          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeBtnText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

export default function TechniciansByService({ route, navigation }) {
  const service = route?.params?.service || route?.params?.serviceName || "";

  const [technicians, setTechnicians] = useState([]);
  const [smartResults, setSmartResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [smartLoading, setSmartLoading] = useState(false);
  const [userCity, setUserCity] = useState("");

  const [search, setSearch] = useState("");
  const [resultType, setResultType] = useState("technicians");
  const [priceFilter, setPriceFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState("all");

  const [commentsOpen, setCommentsOpen] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState(null);

  const loadTechnicians = async () => {
    try {
      setLoading(true);

      const rawUser = await AsyncStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : {};
      setUserCity(user?.city || "");

      const data = await getTechnicians(service);
      setTechnicians(Array.isArray(data) ? data : []);
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

  useEffect(() => {
    const value = search.trim();

    if (!value) {
      setSmartResults(null);
      setSmartLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSmartLoading(true);

        const data = await smartSearchTechnicians({
          searchText: value,
          service,
          userCity,
        });

        setSmartResults(Array.isArray(data?.technicians) ? data.technicians : []);
      } catch (err) {
        console.log("smart search error:", err?.response?.data || err.message);
        setSmartResults(null);
      } finally {
        setSmartLoading(false);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [search, service, userCity]);

  const locationOptions = useMemo(() => {
    const fromTechnicians = technicians
      .map((tech) => String(tech.city || "").trim())
      .filter(Boolean);

    const merged = [...jordanCities, ...fromTechnicians];

    const unique = [];
    merged.forEach((city) => {
      if (!unique.some((item) => normalizeText(item) === normalizeText(city))) {
        unique.push(city);
      }
    });

    return [
      { label: "All locations", value: "all" },
      ...unique.map((city) => ({ label: city, value: city })),
    ];
  }, [technicians]);

  const filteredTechnicians = useMemo(() => {
    if (resultType === "stores") return [];

    let result =
      search.trim() && Array.isArray(smartResults) ? smartResults : [...technicians];

    if (priceFilter === "low") {
      result = result.filter((tech) => getPrice(tech) <= 10);
    }

    if (priceFilter === "mid") {
      result = result.filter(
        (tech) => getPrice(tech) > 10 && getPrice(tech) <= 25
      );
    }

    if (priceFilter === "high") {
      result = result.filter((tech) => getPrice(tech) > 25);
    }

    if (locationFilter !== "all") {
      result = result.filter(
        (tech) => normalizeText(tech.city) === normalizeText(locationFilter)
      );
    }

    if (ratingFilter !== "all") {
      result = result.filter((tech) => getRating(tech) >= Number(ratingFilter));
    }

    return result;
  }, [
    technicians,
    smartResults,
    search,
    resultType,
    priceFilter,
    locationFilter,
    ratingFilter,
  ]);

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
            placeholder="Ask or search: name, city, cheapest, best..."
            placeholderTextColor="#8B7D70"
          />

          {search.trim() ? (
            <View style={styles.smartHint}>
              <Text style={styles.smartHintText}>
                Assistant search: {search}
                {smartLoading ? " ..." : ""}
              </Text>
            </View>
          ) : null}

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
                options={locationOptions}
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
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Loading technicians...</Text>
            </View>
          ) : resultType === "stores" ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>
                Store results will be connected later.
              </Text>
            </View>
          ) : smartLoading ? (
            <View style={styles.emptyCard}>
              <Text style={styles.emptyText}>Searching...</Text>
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
                    Price: {getPrice(tech).toFixed(2)} JOD/hour
                  </Text>
                  <Text style={styles.info}>
                    Rating: ⭐ {getRating(tech).toFixed(1)}
                    {tech.review_count ? ` (${tech.review_count})` : ""}
                  </Text>

                  <TouchableOpacity
                    onPress={() => {
                      setSelectedTechnicianId(technicianId);
                      setCommentsOpen(true);
                    }}
                  >
                    <Text style={styles.commentsLink}>View comments</Text>
                  </TouchableOpacity>

                  <Text style={styles.bio}>
                    {tech.bio || "Experienced technician ready to help."}
                  </Text>

                  <View style={styles.actions}>
                    <TouchableOpacity
                      style={styles.primaryBtn}
                      onPress={() =>
                        navigation.navigate("TechnicianProfile", {
                          technicianId,
                          technician_id: technicianId,
                          tech,
                          readOnlyGallery: true,
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
                          technician_id: technicianId,
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

      <CommentsModal
        visible={commentsOpen}
        technicianId={selectedTechnicianId}
        onClose={() => {
          setCommentsOpen(false);
          setSelectedTechnicianId(null);
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E7DCCC" },
  container: { padding: 18, paddingBottom: 80 },
  panel: {
    backgroundColor: "#FFFAF4",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 30,
    padding: 20,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    color: "#111",
    marginBottom: 20,
  },
  search: {
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 999,
    height: 58,
    paddingHorizontal: 20,
    fontSize: 17,
    marginBottom: 12,
  },
  smartHint: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
  },
  smartHintText: {
    color: "#3A3028",
    fontSize: 15,
    fontWeight: "800",
  },
  filterGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 12,
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
  commentsLink: {
    color: "#111",
    fontSize: 16,
    fontWeight: "900",
    textDecorationLine: "underline",
    marginTop: 10,
  },
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
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  commentsModal: {
    width: "100%",
    backgroundColor: "#FFFAF4",
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  commentsTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111",
    marginBottom: 18,
  },
  noComments: {
    fontSize: 18,
    color: "#4D433B",
    textAlign: "center",
    marginVertical: 30,
  },
  commentRow: {
    borderBottomWidth: 1,
    borderBottomColor: "#EADFCE",
    paddingVertical: 14,
  },
  commentTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  commentUser: { color: "#111", fontWeight: "900", fontSize: 17 },
  commentRating: { color: "#111", fontWeight: "900", fontSize: 16 },
  commentText: { color: "#3A3028", fontSize: 16, lineHeight: 23 },
  closeBtn: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 15,
    marginTop: 18,
    alignItems: "center",
  },
  closeBtnText: { color: "#fff", fontWeight: "900", fontSize: 17 },
});