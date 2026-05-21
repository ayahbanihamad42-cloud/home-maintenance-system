import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import API from "../../services/api";

export default function TechnicianRequests({ navigation, route }) {
  const user = route?.params?.user || {};
  const userId = user?.id || user?.user_id;

  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadRequests = async () => {
    try {
      setLoading(true);
      setError("");

      const techRes = await API.get(`/technicians/user/${userId}`);
      const tech = techRes.data;

      if (!tech?.technicianId && !tech?.id) {
        setError("Technician not found.");
        setRequests([]);
        return;
      }

      const technicianId = tech.technicianId || tech.id;

      const res = await API.get(`/technicians/requests/my`);
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("technician requests error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to load technician requests.");
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) loadRequests();
  }, [userId]);

  const filtered = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter(
      (r) =>
        String(r.status || "").toLowerCase() ===
        String(statusFilter).toLowerCase()
    );
  }, [requests, statusFilter]);

  const changeStatus = async (requestId, status) => {
    try {
      setError("");
      await API.put(`/technicians/requests/${requestId}/status`, { status });
      loadRequests();
    } catch (err) {
      console.log("status error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Failed to update status.");
    }
  };

  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).split("T")[0];
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
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => changeStatus(req.id, "on_the_way")}
          >
            <Text style={styles.btnText}>On The Way</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === "on_the_way") {
      return (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => changeStatus(req.id, "in_progress")}
          >
            <Text style={styles.btnText}>Start Work</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === "in_progress") {
      return (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.btn}
            onPress={() => changeStatus(req.id, "completed")}
          >
            <Text style={styles.btnText}>Complete</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return null;
  };

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Technician Requests</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <View style={styles.pickerBox}>
          <Picker selectedValue={statusFilter} onValueChange={setStatusFilter}>
            <Picker.Item label="All requests" value="all" />
            <Picker.Item label="Pending" value="pending" />
            <Picker.Item label="Accepted" value="accepted" />
            <Picker.Item label="On The Way" value="on_the_way" />
            <Picker.Item label="In Progress" value="in_progress" />
            <Picker.Item label="Completed" value="completed" />
            <Picker.Item label="Rejected" value="rejected" />
            <Picker.Item label="Cancelled" value="cancelled" />
          </Picker>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#111" />
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
              <Text style={styles.line}>Time: {req.scheduled_time || "-"}</Text>
              <Text style={styles.line}>User: {req.user_name || req.user_id || "-"}</Text>
              <Text style={styles.line}>Phone: {req.phone || "-"}</Text>
              <Text style={styles.line}>
                Location: {req.location || req.location_note || req.city || "-"}
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

function Header({ navigation }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuBtn} onPress={() => setOpen(!open)}>
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Maintenance System</Text>

      <TouchableOpacity style={styles.bell}>
        <Text style={styles.bellText}>🔔</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => navigation.navigate("TechnicianDashboard")}>
            <Text style={styles.menuItem}>Dashboard</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("TechnicianProfile")}>
            <Text style={styles.menuItem}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("AIChat")}>
            <Text style={styles.menuItem}>AI Assistant</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("ChatList")}>
            <Text style={styles.menuItem}>Chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e7dccc" },
  header: {
    minHeight: 96,
    backgroundColor: "#faf5ef",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#d8c8b8",
    zIndex: 100,
  },
  menuBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  menuText: { fontSize: 34, fontWeight: "900" },
  headerTitle: { flex: 1, fontSize: 26, fontWeight: "900", marginLeft: 12 },
  bell: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  bellText: { fontSize: 26 },
  logout: {
    backgroundColor: "#111",
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 28,
  },
  logoutText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  menu: {
    position: "absolute",
    top: 88,
    left: 18,
    width: 230,
    backgroundColor: "#fffaf4",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d8c8b8",
    elevation: 10,
  },
  menuItem: { fontSize: 18, fontWeight: "800", paddingVertical: 12 },
  container: { padding: 24, paddingBottom: 60 },
  title: { fontSize: 40, fontWeight: "900", marginBottom: 20 },
  error: {
    backgroundColor: "#fdebed",
    color: "#b4232b",
    padding: 14,
    borderRadius: 14,
    fontSize: 17,
    marginBottom: 16,
  },
  pickerBox: {
    backgroundColor: "#f7efe7",
    borderWidth: 1,
    borderColor: "#d8c8b8",
    borderRadius: 28,
    overflow: "hidden",
    marginBottom: 24,
  },
  emptyCard: {
    backgroundColor: "#fffaf4",
    padding: 32,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  empty: { fontSize: 22, textAlign: "center" },
  card: {
    backgroundColor: "#fffaf4",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#d8c8b8",
    marginBottom: 16,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  service: { fontSize: 24, fontWeight: "900", flex: 1 },
  badge: {
    backgroundColor: "#111",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
    fontWeight: "900",
  },
  desc: { fontSize: 18, marginVertical: 14 },
  line: { fontSize: 17, marginTop: 6, color: "#3d342d" },
  actions: { flexDirection: "row", gap: 10, marginTop: 18, flexWrap: "wrap" },
  btn: {
    backgroundColor: "#111",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 18,
  },
  btnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  btnOutline: {
    backgroundColor: "#fffaf4",
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#111",
  },
  btnOutlineText: { color: "#111", fontWeight: "900", fontSize: 16 },
});