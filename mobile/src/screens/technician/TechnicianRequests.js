import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet } from "react-native";
import { Picker } from "@react-native-picker/picker";

import Header from "../../components/Common/Header";
import API from "../../services/api";
import { getTechnicianByUserId } from "../../services/technicianService";

function TechnicianRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const userText = await global.localStorage?.getItem?.("user");
        const user = userText ? JSON.parse(userText) : {};

        const tech = await getTechnicianByUserId(user.id);
        const res = await API.get(`/technicians/${tech.technicianId}/requests`);

        setRequests(res.data || []);
      } catch (err) {
        console.error("technician requests error:", err);
        setRequests([]);
      }
    };

    loadRequests();
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
        <Text style={styles.title}>Technician Requests</Text>

        <View style={styles.filterPanel}>
          <Text style={styles.label}>Filter by request status</Text>

          <View style={styles.pickerBox}>
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

              <Text>Status: {req.status}</Text>
              <Text>Date: {req.scheduled_date}</Text>
              <Text>Time: {req.scheduled_time}</Text>
              <Text>User ID: {req.user_id}</Text>
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
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  filterPanel: {
    backgroundColor: "#FFF9F3",
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    marginBottom: 16,
  },
  label: {
    fontWeight: "bold",
    marginBottom: 6,
  },
  pickerBox: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 12,
    overflow: "hidden",
  },
  card: {
    backgroundColor: "#FFF9F3",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  description: {
    marginVertical: 8,
    color: "#3C332B",
  },
  emptyCard: {
    backgroundColor: "#FFF9F3",
    padding: 18,
    borderRadius: 16,
    alignItems: "center",
  },
  emptyText: {
    color: "#5D5147",
  },
});

export default TechnicianRequests;