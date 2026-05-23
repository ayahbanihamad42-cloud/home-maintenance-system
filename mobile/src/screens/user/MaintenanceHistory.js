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

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadHistory);
    return unsubscribe;
  }, [navigation]);

  const loadHistory = async () => {
    setLoading(true);

    try {
      const rawUser = await AsyncStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;

      if (!user?.id) {
        setRequests([]);
        return;
      }

      let res;

      try {
        res = await API.get("/maintenance/my");
      } catch {
        res = await API.get(`/maintenance/user/${user.id}`);
      }

      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("history error:", err?.response?.data || err.message);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    if (statusFilter === "all") return requests;

    return requests.filter(
      (request) =>
        String(request.status || "").toLowerCase() ===
        String(statusFilter).toLowerCase()
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

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Maintenance History</Text>

        <CustomDropdown
          value={statusFilter}
          onChange={setStatusFilter}
          placeholder="All requests"
          options={[
            { label: "All requests", value: "all" },
            { label: "Pending", value: "pending" },
            { label: "Accepted", value: "accepted" },
            { label: "On The Way", value: "on_the_way" },
            { label: "In Progress", value: "in_progress" },
            { label: "Completed", value: "completed" },
            { label: "Rejected", value: "rejected" },
            { label: "Cancelled", value: "cancelled" },
          ]}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#111" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No requests found.</Text>
          </View>
        ) : (
          filtered.map((request) => (
            <View key={request.id} style={styles.requestCard}>
              <View style={styles.cardTop}>
                <Text style={styles.serviceText}>
                  {request.service || request.service_type || "Maintenance"}
                </Text>

                <Text style={styles.statusBadge}>{request.status || "pending"}</Text>
              </View>

              <Text style={styles.description}>
                {request.description || "No description"}
              </Text>

              <Text style={styles.info}>
                Technician: {request.technician_name || request.technician_id || "-"}
              </Text>
              <Text style={styles.info}>Date: {formatDate(request.scheduled_date)}</Text>
              <Text style={styles.info}>Time: {formatTime(request.scheduled_time)}</Text>
              <Text style={styles.info}>
                Location: {request.location_note || request.location || request.city || "-"}
              </Text>
              <Text style={styles.info}>Payment: {request.payment_method || "-"}</Text>
              <Text style={styles.info}>
                Total: {Number(request.total_price || request.total || 0).toFixed(2)} JOD
              </Text>

              <TouchableOpacity
                style={styles.reviewBtn}
                onPress={() =>
                  navigation.navigate("Review", {
                    requestId: request.id,
                    request,
                  })
                }
              >
                <Text style={styles.reviewBtnText}>Review</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DCCF",
  },
  container: {
    padding: 24,
    paddingBottom: 80,
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#111",
    marginBottom: 24,
  },
  emptyCard: {
    marginTop: 28,
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 28,
    padding: 34,
  },
  emptyText: {
    textAlign: "center",
    fontSize: 22,
    color: "#4D433B",
  },
  requestCard: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 28,
    padding: 22,
    marginTop: 18,
  },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
  },
  serviceText: {
    flex: 1,
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
  },
  statusBadge: {
    backgroundColor: "#111",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    overflow: "hidden",
    fontWeight: "900",
  },
  description: {
    fontSize: 18,
    marginVertical: 14,
    color: "#111",
  },
  info: {
    fontSize: 17,
    marginTop: 7,
    color: "#3D342D",
  },
  reviewBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 18,
  },
  reviewBtnText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
  },
});