import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "../../components/Common/Header";
import API from "../../services/api";

function TechnicianRequests() {
  const [requests, setRequests] = useState([]);
  const [technicianId, setTechnicianId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTechnician = async () => {
      try {
        const rawUser = await AsyncStorage.getItem("user");
        const user = rawUser ? JSON.parse(rawUser) : null;

        if (!user?.id) {
          setLoading(false);
          return;
        }

        const res = await API.get(`/technicians/user/${user.id}`);
        setTechnicianId(res.data.technicianId);
      } catch (error) {
        console.error(error);
        setTechnicianId(null);
        setLoading(false);
      }
    };

    loadTechnician();
  }, []);

  useEffect(() => {
    if (!technicianId) {
      setLoading(false);
      return;
    }

    API.get(`/technicians/${technicianId}/requests`)
      .then((res) => setRequests(res.data || []))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [technicianId]);

  const updateStatus = (id, status) => {
    API.patch(`/maintenance/${id}/status`, { status })
      .then(() =>
        setRequests((prev) =>
          prev.map((item) => (item.id === id ? { ...item, status } : item))
        )
      )
      .catch((err) => console.error(err));
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  if (!requests.length) {
    return (
      <View style={styles.loaderContainer}>
        <Text>No requests yet.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#E8DCCF" }}>
      <Header />
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => {
          const mapQuery = item.location_note
            ? encodeURIComponent(item.location_note)
            : "Irbid";

          return (
            <View style={styles.card}>
              <Text><Text style={styles.bold}>Service:</Text> {item.service}</Text>
              <Text><Text style={styles.bold}>Status:</Text> {item.status}</Text>
              <Text><Text style={styles.bold}>Date:</Text> {item.scheduled_date}</Text>
              <Text><Text style={styles.bold}>Time:</Text> {item.scheduled_time}</Text>
              <Text><Text style={styles.bold}>Location:</Text> {item.location_note || "Not provided"}</Text>
              <Text><Text style={styles.bold}>Issue:</Text> {item.description || "Not provided"}</Text>

              <View style={{ height: 200, marginVertical: 10, overflow: "hidden", borderRadius: 12 }}>
                <WebView
                  source={{ uri: `https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed` }}
                />
              </View>

              <View style={styles.actions}>
                <Button
                  title="Confirm"
                  onPress={() => updateStatus(item.id, "confirmed")}
                  color="#007BFF"
                />
                <View style={{ height: 10 }} />
                <Button
                  title="Mark Completed"
                  onPress={() => updateStatus(item.id, "completed")}
                  color="#28A745"
                />
              </View>
            </View>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  card: {
    backgroundColor: "#FFF9F3",
    padding: 15,
    marginBottom: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  bold: {
    fontWeight: "bold",
  },
  actions: {
    marginTop: 10,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E8DCCF",
  },
});

export default TechnicianRequests;