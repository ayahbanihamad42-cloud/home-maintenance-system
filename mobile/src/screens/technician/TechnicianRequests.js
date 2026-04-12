import React, { useEffect, useState } from "react";
import { View, Text, Button, FlatList, StyleSheet, ActivityIndicator } from "react-native";
import { WebView } from "react-native-webview";
import Header from "../../components/common/Header";
import API from "../../services/api";

function TechnicianRequests() {
  const [requests, setRequests] = useState([]);
  const [technicianId, setTechnicianId] = useState(null);
  const userId = JSON.parse(localStorage.getItem("user")).id; // يمكن تغييره لاحقًا لاستخدام AsyncStorage

  // Fetch technician ID
  useEffect(() => {
    API.get(`/technicians/user/${userId}`)
      .then((res) => setTechnicianId(res.data.technicianId))
      .catch(() => setTechnicianId(null));
  }, [userId]);

  // Fetch assigned requests
  useEffect(() => {
    if (!technicianId) return;

    API.get(`/technicians/${technicianId}/requests`)
      .then((res) => setRequests(res.data))
      .catch((err) => console.error(err));
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

  if (!requests.length) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#007BFF" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Header />
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.container}
        renderItem={({ item }) => {
          const mapQuery = item.location_note
            ? encodeURIComponent(item.location_note)
            : "Riyadh";

          return (
            <View style={styles.card}>
              <Text style={styles.bold}>Service:</Text> <Text>{item.service}</Text>
              <Text style={styles.bold}>Status:</Text> <Text>{item.status}</Text>
              <Text style={styles.bold}>Date:</Text> <Text>{item.scheduled_date}</Text>
              <Text style={styles.bold}>Time:</Text> <Text>{item.scheduled_time}</Text>
              <Text style={styles.bold}>Location:</Text> <Text>{item.location_note || "Not provided"}</Text>
              <Text style={styles.bold}>Issue:</Text> <Text>{item.description || "Not provided"}</Text>

              <View style={{ height: 200, marginVertical: 10 }}>
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
    backgroundColor: "#fff",
    padding: 15,
    marginBottom: 20,
    borderRadius: 10,
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
  },
});

export default TechnicianRequests;