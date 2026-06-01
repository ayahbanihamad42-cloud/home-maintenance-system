import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const TechnicianRequests = ({ navigation }) => {
  const [requests, setRequests] = useState([]);
  const [message, setMessage] = useState("");

  const load = async () => {
    try {
      const res = await API.get("/technicians/requests");
      setRequests(Array.isArray(res.data) ? res.data : []);
    } catch {
      setRequests([]);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id, status) => {
    try {
      await API.put(`/technicians/requests/${id}/status`, { status });
      setMessage("Status updated successfully.");
      await load();
    } catch {
      setMessage("Failed to update status.");
    }
  };

  const next = (r) => {
    const s = String(r.status || "").toLowerCase();
    if (s === "pending") return "accepted";
    if (s === "accepted") return "on_the_way";
    if (s === "on_the_way") return "in_progress";
    if (s === "in_progress") return "completed";
    return "";
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Requests" />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Technician Requests</Text>
          <Text style={appStyles.heroSubtitle}>Update request status and track work.</Text>
        </View>

        {message ? (
          <View style={message.includes("Failed") ? appStyles.errorBox : appStyles.successBox}>
            <Text style={message.includes("Failed") ? appStyles.errorText : appStyles.successText}>{message}</Text>
          </View>
        ) : null}

        {requests.map((r) => {
          const nextStatus = next(r);

          return (
            <View style={appStyles.card} key={r.id}>
              <View style={appStyles.between}>
                <Text style={appStyles.sectionTitle}>{r.service}</Text>
                <View style={appStyles.statusBadge}>
                  <Text style={appStyles.statusText}>{r.status}</Text>
                </View>
              </View>

              <Text style={appStyles.text}>User: {r.user_name || r.customer_name || "-"}</Text>
              <Text style={appStyles.text}>Phone: {r.user_phone || "-"}</Text>
              <Text style={appStyles.text}>Date: {String(r.scheduled_date || "").slice(0, 10)}</Text>
              <Text style={appStyles.text}>Time: {String(r.scheduled_time || "").slice(0, 8)}</Text>
              <Text style={appStyles.text}>Description: {r.description || "-"}</Text>

              {nextStatus ? (
                <TouchableOpacity style={appStyles.primaryBtn} onPress={() => updateStatus(r.id, nextStatus)}>
                  <Text style={appStyles.primaryBtnText}>
                    {nextStatus.replaceAll("_", " ")}
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          );
        })}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
};

export default TechnicianRequests;