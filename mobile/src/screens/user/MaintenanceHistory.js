import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
} from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import CustomDropdown from "../../components/Common/CustomDropdown";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const statusOptions = [
  { label: "All statuses", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Accepted", value: "accepted" },
  { label: "On the way", value: "on_the_way" },
  { label: "In progress", value: "in_progress" },
  { label: "Completed", value: "completed" },
  { label: "Rejected", value: "rejected" },
  { label: "Cancelled", value: "cancelled" },
];

function MaintenanceHistory({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [message, setMessage] = useState("");

  const formatDate = (value) => {
    if (!value) return "-";
    const raw = String(value);
    const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : raw.slice(0, 10);
  };

  const formatTime = (value) => (value ? String(value).slice(0, 8) : "-");

  const loadHistory = async () => {
    try {
      setMessage("");
      const res = await API.get("/maintenance/my");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch {
      try {
        const res = await API.get("/maintenance/history/my");
        setRequests(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        setRequests([]);
        setMessage(err.response?.data?.message || "Failed to load history.");
      }
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadHistory);
    loadHistory();
    return unsubscribe;
  }, [navigation]);

  const filteredRequests = useMemo(() => {
    let result = [...requests];

    if (statusFilter !== "all") {
      result = result.filter(
        (item) => String(item.status || "").toLowerCase() === statusFilter
      );
    }

    return result.sort((a, b) => Number(b.id || 0) - Number(a.id || 0));
  }, [requests, statusFilter]);

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="History" />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <HeroSection
          title="Maintenance History"
          subtitle="Track your previous and current maintenance requests."
        />

        <View style={appStyles.card}>
          <CustomDropdown
            label="Filter Requests"
            value={statusFilter}
            options={statusOptions}
            onChange={setStatusFilter}
          />

          <TouchableOpacity
            style={appStyles.secondaryBtn}
            onPress={() => setStatusFilter("all")}
          >
            <Text style={appStyles.secondaryBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>

        {message ? (
          <View style={appStyles.errorBox}>
            <Text style={appStyles.errorText}>{message}</Text>
          </View>
        ) : null}

        {filteredRequests.length === 0 ? (
          <View style={appStyles.card}>
            <Text style={appStyles.sectionTitle}>No requests found</Text>
            <Text style={appStyles.mutedText}>
              Your maintenance requests will appear here.
            </Text>
          </View>
        ) : (
          filteredRequests.map((item) => (
            <View style={appStyles.card} key={item.id}>
              <View style={appStyles.between}>
                <Text style={appStyles.sectionTitle}>{item.service || "-"}</Text>
                <View style={appStyles.statusBadge}>
                  <Text style={appStyles.statusText}>
                    {String(item.status || "-").replaceAll("_", " ")}
                  </Text>
                </View>
              </View>

              <Text style={appStyles.text}>
                Technician: {item.technician_name || "-"}
              </Text>
              <Text style={appStyles.text}>Date: {formatDate(item.scheduled_date)}</Text>
              <Text style={appStyles.text}>Time: {formatTime(item.scheduled_time)}</Text>
              <Text style={appStyles.text}>Payment: {item.payment_method || "-"}</Text>
              <Text style={appStyles.text}>
                Total: {Number(item.total_price || item.amount || 0).toFixed(2)} JOD
              </Text>

              <TouchableOpacity
                style={appStyles.primaryBtn}
                onPress={() =>
                  navigation.navigate("Review", {
                    requestId: item.id,
                  })
                }
              >
                <Text style={appStyles.primaryBtnText}>View Details</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default MaintenanceHistory;