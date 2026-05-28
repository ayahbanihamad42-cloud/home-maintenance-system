import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Header from "../../components/Common/Header";
import API from "../../services/api";

const formatDateOnly = (value) => {
  if (!value) return "-";

  const raw = String(value).trim();

  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  return raw.slice(0, 10);
};

const formatTimeOnly = (value) => {
  if (!value) return "-";

  const raw = String(value).trim();
  const match = raw.match(/^(\d{2}:\d{2})(:\d{2})?/);

  if (match) return match[0];

  return raw.slice(0, 8);
};

const getUserLocation = (item) => {
  const lat = Number(item?.user_location_lat);
  const lng = Number(item?.user_location_lng);

  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    return { latitude: lat, longitude: lng };
  }

  const url = String(item?.user_location_url || "");
  const match = url.match(/q=(-?\d+(\.\d+)?),(-?\d+(\.\d+)?)/);

  if (match) {
    const parsedLat = Number(match[1]);
    const parsedLng = Number(match[3]);

    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLng)) {
      return { latitude: parsedLat, longitude: parsedLng };
    }
  }

  return null;
};

const nextActions = (status) => {
  const s = String(status || "").toLowerCase();

  if (s === "pending") {
    return [
      { label: "Accept", value: "accepted" },
      { label: "Reject", value: "rejected" },
    ];
  }

  if (s === "accepted" || s === "confirmed") {
    return [{ label: "On Way", value: "on_the_way" }];
  }

  if (s === "on_the_way") {
    return [{ label: "In Process", value: "in_progress" }];
  }

  if (s === "in_progress") {
    return [{ label: "Complete", value: "completed" }];
  }

  return [];
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

export default function TechnicianRequests({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const [updatingId, setUpdatingId] = useState(null);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    try {
      setRefreshing(true);
      setError("");

      const res = await API.get("/technicians/requests/my");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log(
        "technician requests error:",
        err?.response?.data || err.message
      );
      setRequests([]);
      setError(err?.response?.data?.message || "Failed to load requests.");
    } finally {
      setRefreshing(false);
    }
  };

  const updateStatus = async (requestId, status) => {
    try {
      setUpdatingId(requestId);
      setError("");

      await API.put(`/technicians/requests/${requestId}/status`, { status });
      await loadRequests();
    } catch (err) {
      console.log("status update error:", err?.response?.data || err.message);
      setError(err?.response?.data?.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  useEffect(() => {
    loadRequests();
    const unsubscribe = navigation.addListener("focus", loadRequests);
    return unsubscribe;
  }, [navigation]);

  const sortedRequests = useMemo(() => {
    return [...requests].sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
  }, [requests]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return sortedRequests;

    return sortedRequests.filter(
      (item) => String(item.status || "").toLowerCase() === statusFilter
    );
  }, [sortedRequests, statusFilter]);

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Technician Requests</Text>

        <TouchableOpacity style={styles.refreshBtn} onPress={loadRequests}>
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
              {refreshing ? "Loading requests..." : "No assigned requests yet."}
            </Text>
          </View>
        ) : (
          filteredRequests.map((item) => {
            const actions = nextActions(item.status);
            const userLoc = getUserLocation(item);

            return (
              <View key={item.id} style={styles.card}>
                <Text style={styles.service}>{item.service || "-"}</Text>
                <Text style={styles.statusBadge}>{item.status || "-"}</Text>

                <Text style={styles.text}>
                  <Text style={styles.bold}>Customer:</Text>{" "}
                  {item.user_name || item.customer_name || "N/A"}
                </Text>

                <Text style={styles.text}>
                  <Text style={styles.bold}>Phone:</Text>{" "}
                  {item.user_phone || "-"}
                </Text>

                <Text style={styles.text}>
                  <Text style={styles.bold}>Date:</Text>{" "}
                  {formatDateOnly(item.scheduled_date)}
                </Text>

                <Text style={styles.text}>
                  <Text style={styles.bold}>Time:</Text>{" "}
                  {formatTimeOnly(item.scheduled_time)}
                </Text>

                <Text style={styles.text}>
                  <Text style={styles.bold}>Location Note:</Text>{" "}
                  {item.location_note || item.city || "-"}
                </Text>

                {userLoc ? (
                  <View style={styles.mapSection}>
                    <Text style={styles.mapTitle}>Customer Location</Text>

                    <MapView
                      style={styles.map}
                      initialRegion={{
                        latitude: userLoc.latitude,
                        longitude: userLoc.longitude,
                        latitudeDelta: 0.005,
                        longitudeDelta: 0.005,
                      }}
                    >
                      <Marker
                        coordinate={{
                          latitude: userLoc.latitude,
                          longitude: userLoc.longitude,
                        }}
                        title="Customer Location"
                        description="Static request location"
                      />
                    </MapView>

                    <Text style={styles.mapNote}>
                      Static location shared when the request was created.
                    </Text>
                  </View>
                ) : null}

                <Text style={styles.description}>{item.description || "-"}</Text>

                {actions.length > 0 ? (
                  <View style={styles.buttonsRow}>
                    {actions.map((action) => (
                      <TouchableOpacity
                        key={action.value}
                        disabled={updatingId === item.id}
                        style={[
                          styles.statusBtn,
                          action.value === "rejected" && styles.rejectBtn,
                        ]}
                        onPress={() => updateStatus(item.id, action.value)}
                      >
                        <Text style={styles.statusText}>
                          {updatingId === item.id ? "..." : action.label}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <Text style={styles.finalStatus}>No actions available</Text>
                )}
              </View>
            );
          })
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
  filtersRow: {
    gap: 10,
    paddingBottom: 18,
  },
  filterBtn: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  filterBtnActive: {
    backgroundColor: "#111",
    borderColor: "#111",
  },
  filterText: {
    color: "#111",
    fontWeight: "900",
    fontSize: 14,
  },
  filterTextActive: {
    color: "#FFF",
  },
  messageBox: {
    backgroundColor: "#FFF9F3",
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    marginBottom: 14,
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
  service: { fontSize: 24, fontWeight: "900", color: "#111", marginBottom: 10 },
  statusBadge: {
    alignSelf: "flex-start",
    backgroundColor: "#F7EFE7",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    color: "#6B5E55",
    fontWeight: "900",
    textTransform: "capitalize",
    marginBottom: 14,
  },
  text: { fontSize: 16, color: "#2F2723", marginBottom: 5, fontWeight: "700" },
  bold: { fontWeight: "900", color: "#111" },
  mapSection: {
    marginTop: 14,
    marginBottom: 14,
  },
  mapTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111",
    marginBottom: 10,
  },
  map: {
    width: "100%",
    height: 240,
    borderRadius: 22,
  },
  mapNote: {
    marginTop: 8,
    color: "#6B5E52",
    fontSize: 14,
    fontWeight: "700",
  },
  description: {
    fontSize: 15,
    color: "#5C5048",
    marginTop: 10,
    lineHeight: 22,
  },
  buttonsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 18,
  },
  statusBtn: {
    backgroundColor: "#111",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  rejectBtn: {
    backgroundColor: "#7A1F1F",
  },
  statusText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 15,
  },
  finalStatus: {
    marginTop: 16,
    fontSize: 15,
    fontWeight: "800",
    color: "#6B5E55",
  },
});