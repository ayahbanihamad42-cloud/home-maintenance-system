import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../components/Common/Header";
import API from "../../services/api";
import CustomDropdown from "../../components/Common/CustomDropdown";

export default function MaintenanceHistory({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const loadHistory = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const rawUser = await AsyncStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;

      if (!user?.id) {
        setRequests([]);
        setMessage({
          type: "error",
          title: "Notice",
          body: "User id is missing. Please login again.",
        });
        return;
      }

      const res = await API.get("/maintenance/my");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("history error:", err?.response?.data || err.message);
      setRequests([]);
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to load maintenance history.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadHistory);
    return unsubscribe;
  }, [navigation]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter(
      (r) => String(r.status || "").toLowerCase() === statusFilter
    );
  }, [requests, statusFilter]);

  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).split("T")[0];
  };

  const formatTime = (value) => {
    if (!value) return "-";
    return String(value).slice(0, 8);
  };

  const options = [
    { label: "All requests", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Accepted", value: "accepted" },
    { label: "On The Way", value: "on_the_way" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
    { label: "Rejected", value: "rejected" },
    { label: "Cancelled", value: "cancelled" },
  ];

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Maintenance History</Text>

        <CustomDropdown
          value={statusFilter}
          options={options}
          onChange={setStatusFilter}
          placeholder="All requests"
        />

        {message ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>{message.title}</Text>
            <Text style={styles.messageBody}>{message.body}</Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color="#111" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No requests found.</Text>
          </View>
        ) : (
          filtered.map((req) => (
            <TouchableOpacity
              key={req.id}
              style={styles.card}
              onPress={() =>
                navigation.navigate("Review", {
                  requestId: req.id,
                  request: req,
                })
              }
            >
              <View style={styles.cardTop}>
                <Text style={styles.service}>
                  {req.service || req.service_type || "Maintenance"}
                </Text>
                <Text style={styles.badge}>{req.status || "-"}</Text>
              </View>

              <Text style={styles.desc}>{req.description || "No description"}</Text>
              <Text style={styles.line}>Date: {formatDate(req.scheduled_date)}</Text>
              <Text style={styles.line}>Time: {formatTime(req.scheduled_time)}</Text>
              <Text style={styles.line}>Created Date: {formatDate(req.created_at)}</Text>
              <Text style={styles.line}>
                Technician: {req.technician_name || req.technician_id || "-"}
              </Text>
              <Text style={styles.line}>
                Location: {req.location_note || req.location || req.city || "-"}
              </Text>
              <Text style={styles.line}>Payment: {req.payment_method || "-"}</Text>
              <Text style={styles.line}>
                Total: {Number(req.total_price || req.total || 0).toFixed(2)} JOD
              </Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E7DCCC" },
  container: { padding: 24, paddingBottom: 80 },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#111",
    marginBottom: 24,
  },
  messageBox: {
    backgroundColor: "#FDEBED",
    borderWidth: 1,
    borderColor: "#EFB6BD",
    borderRadius: 18,
    padding: 16,
    marginTop: 18,
  },
  messageTitle: { fontSize: 17, fontWeight: "900", color: "#111" },
  messageBody: { marginTop: 6, fontSize: 16, color: "#A32020" },
  emptyCard: {
    marginTop: 26,
    backgroundColor: "#FFFAF4",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 26,
    padding: 34,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 22,
    color: "#4D433B",
  },
  card: {
    backgroundColor: "#FFFAF4",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 26,
    padding: 22,
    marginTop: 18,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  service: { fontSize: 24, fontWeight: "900", flex: 1 },
  badge: {
    backgroundColor: "#111",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "900",
  },
  desc: { fontSize: 18, marginVertical: 14 },
  line: { fontSize: 17, marginTop: 7, color: "#3D342D" },
});