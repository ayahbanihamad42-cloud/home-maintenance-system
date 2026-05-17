import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

import Header from "../../components/Common/Header";
import { getUserRequests } from "../../services/maintenanceService";

function MaintenanceHistory() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    getUserRequests()
      .then((data) => setRequests(data || []))
      .catch((err) => {
        console.error("history error:", err);
        setRequests([]);
      });
  }, []);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "all") return requests;

    return requests.filter(
      (req) =>
        String(req.status || "").toLowerCase() ===
        String(statusFilter).toLowerCase()
    );
  }, [requests, statusFilter]);

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Maintenance History</Text>

        <View style={styles.filterBox}>
          <Picker selectedValue={statusFilter} onValueChange={setStatusFilter}>
            <Picker.Item label="All requests" value="all" />
            <Picker.Item label="Pending" value="pending" />
            <Picker.Item label="Accepted" value="accepted" />
            <Picker.Item label="In Progress" value="in_progress" />
            <Picker.Item label="Completed" value="completed" />
            <Picker.Item label="Rejected" value="rejected" />
            <Picker.Item label="Cancelled" value="cancelled" />
          </Picker>
        </View>

        {filteredRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>No requests found.</Text>
          </View>
        ) : (
          filteredRequests.map((req) => (
            <View style={styles.card} key={req.id}>
              <Text style={styles.cardTitle}>{req.service}</Text>

              <Text style={styles.description}>{req.description}</Text>

              <Text style={styles.info}>Status: {req.status}</Text>
              <Text style={styles.info}>Date: {req.scheduled_date}</Text>
              <Text style={styles.info}>Time: {req.scheduled_time}</Text>
              <Text style={styles.info}>Technician ID: {req.technician_id}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#E8DCCF",
    flexGrow: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "800",
    color: "#111",
    marginBottom: 12,
  },
  filterBox: {
    height: 44,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    backgroundColor: "#F6EDE2",
    overflow: "hidden",
    justifyContent: "center",
    marginBottom: 16,
  },
  card: {
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    padding: 16,
    marginBottom: 14,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#111",
  },
  description: {
    color: "#3A3028",
    marginVertical: 8,
    lineHeight: 20,
  },
  info: {
    color: "#3A3028",
    marginBottom: 4,
  },
  emptyCard: {
    backgroundColor: "#FFF9F3",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  emptyText: {
    color: "#3A3028",
  },
});

export default MaintenanceHistory;