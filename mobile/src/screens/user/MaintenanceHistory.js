import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import CustomDropdown from "../../components/Common/CustomDropdown";
import API from "../../services/api";
import appStyles, { colors } from "../../styles/mobileStyles";

const statusOptions = [
  { label: "All", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

function MaintenanceHistory({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");

  const loadHistory = async () => {
    try {
      setMessage("");
      const res = await API.get("/maintenance/my");
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.requests)
        ? res.data.requests
        : [];
      setRequests(data);
    } catch (err) {
      setRequests([]);
      setMessage(err.response?.data?.message || "Failed to load history.");
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", loadHistory);
    loadHistory();
    return unsub;
  }, [navigation]);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;
    return requests.filter(
      (r) => String(r.status || "").toLowerCase() === statusFilter
    );
  }, [requests, statusFilter]);

  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).split("T")[0];
  };

  const openReview = (req) => {
    navigation.navigate("Review", {
      requestId: req.id || req.request_id,
      technicianId: req.technician_id || req.technicianId,
      technicianName: req.technician_name || req.tech_name,
      status: req.status,
    });
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="History" />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <HeroSection
          title="Maintenance History"
          subtitle="Track your requests and add reviews after completion."
        />

        {message ? (
          <View style={appStyles.errorBox}>
            <Text style={appStyles.errorText}>{message}</Text>
          </View>
        ) : null}

        <View style={styles.filterBox}>
          <View style={{ flex: 1 }}>
            <CustomDropdown
              label="Status"
              value={statusFilter}
              options={statusOptions}
              onChange={setStatusFilter}
            />
          </View>

          <TouchableOpacity
            style={styles.clearBtn}
            onPress={() => setStatusFilter("all")}
          >
            <Text style={styles.clearText}>Clear</Text>
          </TouchableOpacity>
        </View>

        {filteredRequests.length === 0 ? (
          <View style={appStyles.card}>
            <Text style={appStyles.sectionTitle}>No requests found</Text>
          </View>
        ) : (
          filteredRequests.map((req) => {
            const requestId = req.id || req.request_id;
            const status = String(req.status || "pending").toLowerCase();

            return (
              <View style={appStyles.card} key={requestId}>
                <View style={appStyles.between}>
                  <Text style={appStyles.sectionTitle}>Request #{requestId}</Text>
                  <View style={appStyles.statusBadge}>
                    <Text style={appStyles.statusText}>{status}</Text>
                  </View>
                </View>

                <Text style={appStyles.text}>
                  Service: {req.service || req.service_type || "-"}
                </Text>
                <Text style={appStyles.text}>
                  Technician: {req.technician_name || req.tech_name || "-"}
                </Text>
                <Text style={appStyles.text}>
                  Date: {formatDate(req.scheduled_date || req.date)}
                </Text>
                <Text style={appStyles.text}>
                  Time: {req.scheduled_time || req.time || "-"}
                </Text>
                <Text style={appStyles.text}>
                  Hours: {req.estimated_hours || "-"}
                </Text>
                <Text style={appStyles.text}>
                  Payment: {req.payment_method || "-"}
                </Text>
                <Text style={appStyles.text}>
                  Total: {req.total_price || req.amount || 0} JOD
                </Text>

                {req.description ? (
                  <Text style={appStyles.mutedText}>{req.description}</Text>
                ) : null}

                <TouchableOpacity
                  style={appStyles.primaryBtn}
                  onPress={() => openReview(req)}
                >
                  <Text style={appStyles.primaryBtnText}>
                    {status === "completed" ? "Add Review" : "View Review"}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  filterBox: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 10,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  clearBtn: {
    height: 46,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: colors.primarySoft,
    justifyContent: "center",
    marginTop: 18,
  },
  clearText: {
    color: colors.primary,
    fontWeight: "900",
  },
});

export default MaintenanceHistory;