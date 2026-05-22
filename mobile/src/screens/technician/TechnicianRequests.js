import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import Header from "../../components/Common/Header";
import API from "../../services/api";
import CustomDropdown from "../../components/Common/CustomDropdown";

export default function TechnicianRequests({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const loadRequests = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const res = await API.get("/technicians/requests/my");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("technician requests error:", err?.response?.data || err.message);
      setRequests([]);
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to load technician requests.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadRequests);
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

  const changeStatus = async (requestId, status) => {
    try {
      setMessage(null);
      await API.put(`/technicians/requests/${requestId}/status`, { status });

      setMessage({
        type: "success",
        title: "Updated",
        body: `Request status changed to ${status}.`,
      });

      loadRequests();
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to update status.",
      });
    }
  };

  const actionsForStatus = (req) => {
    const status = String(req.status || "").toLowerCase();

    if (status === "pending") {
      return (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => changeStatus(req.id, "accepted")}
          >
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.btnOutline}
            onPress={() => changeStatus(req.id, "rejected")}
          >
            <Text style={styles.btnOutlineText}>Reject</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === "accepted") {
      return (
        <TouchableOpacity
          style={styles.fullBtn}
          onPress={() => changeStatus(req.id, "on_the_way")}
        >
          <Text style={styles.btnText}>On The Way</Text>
        </TouchableOpacity>
      );
    }

    if (status === "on_the_way") {
      return (
        <TouchableOpacity
          style={styles.fullBtn}
          onPress={() => changeStatus(req.id, "in_progress")}
        >
          <Text style={styles.btnText}>Start Work</Text>
        </TouchableOpacity>
      );
    }

    if (status === "in_progress") {
      return (
        <TouchableOpacity
          style={styles.fullBtn}
          onPress={() => changeStatus(req.id, "completed")}
        >
          <Text style={styles.btnText}>Complete</Text>
        </TouchableOpacity>
      );
    }

    return null;
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
        <Text style={styles.title}>Technician Requests</Text>

        <CustomDropdown
          value={statusFilter}
          options={options}
          onChange={setStatusFilter}
          placeholder="All requests"
        />

        {message ? (
          <View
            style={[
              styles.messageBox,
              message.type === "error" && styles.errorBox,
              message.type === "success" && styles.successBox,
            ]}
          >
            <Text style={styles.messageTitle}>{message.title}</Text>
            <Text style={styles.messageBody}>{message.body}</Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color="#111" style={{ marginTop: 40 }} />
        ) : filtered.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.empty}>No requests found.</Text>
          </View>
        ) : (
          filtered.map((req) => (
            <View key={req.id} style={styles.card}>
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
              <Text style={styles.line}>User: {req.user_name || req.user_id || "-"}</Text>
              <Text style={styles.line}>Phone: {req.phone || "-"}</Text>
              <Text style={styles.line}>
                Location: {req.location_note || req.location || req.city || "-"}
              </Text>
              <Text style={styles.line}>Payment: {req.payment_method || "-"}</Text>
              <Text style={styles.line}>
                Total: {Number(req.total_price || req.total || 0).toFixed(2)} JOD
              </Text>

              {actionsForStatus(req)}
            </View>
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
    padding: 14,
    borderRadius: 18,
    marginTop: 18,
    borderWidth: 1,
  },
  errorBox: { backgroundColor: "#FDEBED", borderColor: "#EFB6BD" },
  successBox: { backgroundColor: "#EEF9F1", borderColor: "#BFE7CA" },
  messageTitle: { fontWeight: "900", fontSize: 16 },
  messageBody: { marginTop: 6, fontSize: 15, color: "#6B5E52" },
  emptyCard: {
    marginTop: 26,
    backgroundColor: "#FFFAF4",
    padding: 32,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  empty: { fontSize: 22, textAlign: "center" },
  card: {
    backgroundColor: "#FFFAF4",
    borderRadius: 26,
    padding: 22,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    marginTop: 18,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
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
  actions: { flexDirection: "row", gap: 12, marginTop: 20 },
  btn: {
    flex: 1,
    backgroundColor: "#111",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  btnOutline: {
    flex: 1,
    backgroundColor: "#FFFAF4",
    paddingVertical: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111",
    alignItems: "center",
  },
  btnOutlineText: { color: "#111", fontWeight: "900", fontSize: 16 },
  fullBtn: {
    backgroundColor: "#111",
    paddingVertical: 16,
    borderRadius: 18,
    alignItems: "center",
    marginTop: 20,
  },
});