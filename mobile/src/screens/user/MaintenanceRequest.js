import React, { useEffect, useMemo, useState } from "react";
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "../../components/Common/Header";
import API from "../../services/api";
import { getTechnicianByUserId } from "../../services/technicianService";

function TechnicianRequests() {
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  const loadRequests = async () => {
    try {
      const userText = await AsyncStorage.getItem("user");
      const user = userText ? JSON.parse(userText) : {};

      const tech = await getTechnicianByUserId(user.id);
      const res = await API.get(`/technicians/${tech.technicianId}/requests`);

      setRequests(res.data || []);
    } catch (err) {
      console.error("technician requests error:", err);
      setRequests([]);
    }
  };

  useEffect(() => {
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

  const updateStatus = async (requestId, status) => {
    try {
      await API.patch(`/maintenance/${requestId}/status`, { status });
      loadRequests();
    } catch (err) {
      console.error("update request status error:", err);
    }
  };

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Technician Requests</Text>

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
              <Text style={styles.info}>User ID: {req.user_id}</Text>

              <View style={styles.actions}>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateStatus(req.id, "accepted")}
                >
                  <Text style={styles.buttonText}>Accept</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateStatus(req.id, "in_progress")}
                >
                  <Text style={styles.buttonText}>Start</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.button}
                  onPress={() => updateStatus(req.id, "completed")}
                >
                  <Text style={styles.buttonText}>Complete</Text>
                </TouchableOpacity>
              </View>
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
  actions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 14,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "700",
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

export default TechnicianRequests;