import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import Header from "../../components/Common/Header";
import { getUserRequests } from "../../services/maintenanceService";

const canReview = (status) => {
  return String(status || "").toLowerCase() === "completed";
};

const formatDateOnly = (value) => {
  if (!value) return "-";

  const raw = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  if (raw.includes("T")) {
    const date = new Date(raw);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Amman",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    }
  }

  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  return raw.slice(0, 10);
};

const filters = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "On Way", value: "on_the_way" },
  { label: "In Process", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

export default function MaintenanceHistory({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadHistory = async () => {
    try {
      setRefreshing(true);
      setError("");

      const data = await getUserRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("history error:", err?.response?.data || err.message);
      setRequests([]);
      setError(err?.response?.data?.message || "Failed to load history.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadHistory();
    const unsubscribe = navigation.addListener("focus", loadHistory);
    return unsubscribe;
  }, [navigation]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;

    return requests.filter(
      (item) => String(item.status || "").toLowerCase() === statusFilter
    );
  }, [requests, statusFilter]);

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Requests History</Text>

        <TouchableOpacity style={styles.refreshBtn} onPress={loadHistory}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersRow}
        >
          {filters.map((filter) => (
            <TouchableOpacity
              key={filter.value}
              style={[
                styles.filterBtn,
                statusFilter === filter.value && styles.filterBtnActive,
              ]}
              onPress={() => setStatusFilter(filter.value)}
            >
              <Text
                style={[
                  styles.filterText,
                  statusFilter === filter.value && styles.filterTextActive,
                ]}
              >
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {error ? (
          <View style={styles.messageBox}>
            <Text style={styles.errorTitle}>Error</Text>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : filteredRequests.length === 0 ? (
          <View style={styles.messageBox}>
            <Text style={styles.emptyText}>
              {refreshing ? "Loading history..." : "No maintenance requests yet."}
            </Text>
          </View>
        ) : (
          filteredRequests.map((item) => (
            <View key={item.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.service}>{item.service || "-"}</Text>
                <Text style={styles.statusBadge}>{item.status || "-"}</Text>
              </View>

              <Text style={styles.text}>
                <Text style={styles.bold}>Technician:</Text>{" "}
                {item.technician_name || "N/A"}
              </Text>

              <Text style={styles.text}>
                <Text style={styles.bold}>Date:</Text>{" "}
                {formatDateOnly(item.scheduled_date)}
              </Text>

              <Text style={styles.text}>
                <Text style={styles.bold}>Time:</Text>{" "}
                {item.scheduled_time || "-"}
              </Text>

              <Text style={styles.description}>{item.description || "-"}</Text>

              <View style={styles.buttonsRow}>
                <TouchableOpacity
                  style={styles.detailsBtn}
                  onPress={() =>
                    navigation.navigate("Review", {
                      requestId: item.id,
                      id: item.id,
                      request: item,
                    })
                  }
                >
                  <Text style={styles.btnText}>Details</Text>
                </TouchableOpacity>

                {canReview(item.status) ? (
                  <TouchableOpacity
                    style={styles.reviewBtn}
                    onPress={() =>
                      navigation.navigate("Review", {
                        requestId: item.id,
                        id: item.id,
                        request: item,
                        technicianId: item.technician_id,
                      })
                    }
                  >
                    <Text style={styles.btnText}>Review</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E8DCCF" },
  container: { padding: 24, paddingBottom: 90 },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111",
    marginBottom: 14,
  },
  refreshBtn: {
    backgroundColor: "#111",
    paddingVertical: 12,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginBottom: 18,
  },
  refreshText: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  filtersRow: { gap: 10, paddingBottom: 18 },
  filterBtn: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  filterBtnActive: { backgroundColor: "#111", borderColor: "#111" },
  filterText: { color: "#111", fontWeight: "900", fontSize: 14 },
  filterTextActive: { color: "#FFF" },
  messageBox: {
    backgroundColor: "#FFF9F3",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  errorTitle: {
    color: "#B4232B",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 6,
  },
  errorText: { color: "#B4232B", fontSize: 15, fontWeight: "700" },
  emptyText: { fontSize: 18, fontWeight: "800", color: "#5C5048" },
  card: {
    backgroundColor: "#FFF9F3",
    borderRadius: 24,
    padding: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  cardHeader: { gap: 8, marginBottom: 10 },
  service: { fontSize: 24, fontWeight: "900", color: "#111" },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F7EFE7",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    color: "#6B5E55",
    fontWeight: "900",
    textTransform: "capitalize",
  },
  text: { fontSize: 16, color: "#2F2723", marginBottom: 5, fontWeight: "700" },
  bold: { fontWeight: "900", color: "#111" },
  description: {
    fontSize: 15,
    color: "#5C5048",
    marginTop: 10,
    lineHeight: 22,
  },
  buttonsRow: {
    flexDirection: "row",
    gap: 12,
    flexWrap: "wrap",
    marginTop: 18,
  },
  detailsBtn: {
    backgroundColor: "#111",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  reviewBtn: {
    backgroundColor: "#111",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  btnText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
});