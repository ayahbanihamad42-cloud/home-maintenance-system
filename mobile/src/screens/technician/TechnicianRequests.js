import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import Header from "../../components/Common/Header";
import {
  getMyTechnicianRequests,
  updateTechnicianRequestStatus,
} from "../../services/technicianService";

export default function TechnicianRequests({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  const formatDateOnly = (value) => {
    if (!value) return "-";
    const raw = String(value);
    const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    return raw.slice(0, 10);
  };

  const formatDateTime = (value) => {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    return d.toLocaleString();
  };

  const loadRequests = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const data = await getMyTechnicianRequests();
      setRequests(Array.isArray(data) ? data : []);
    } catch (err) {
      setRequests([]);
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to load requests.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, []);

  const updateStatus = async (requestId, status) => {
    try {
      await updateTechnicianRequestStatus(requestId, status);

      setMessage({
        type: "success",
        title: "Updated",
        body: "Request status updated successfully.",
      });

      await loadRequests();
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to update request.",
      });
    }
  };

  const renderActions = (item) => {
    const status = String(item.status || "").toLowerCase();

    if (status === "pending") {
      return (
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={() => updateStatus(item.id, "accepted")}
          >
            <Text style={styles.primaryText}>Accept</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => updateStatus(item.id, "rejected")}
          >
            <Text style={styles.secondaryText}>Reject</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (status === "accepted") {
      return (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => updateStatus(item.id, "on_the_way")}
        >
          <Text style={styles.primaryText}>On The Way</Text>
        </TouchableOpacity>
      );
    }

    if (status === "on_the_way") {
      return (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => updateStatus(item.id, "in_progress")}
        >
          <Text style={styles.primaryText}>In Progress</Text>
        </TouchableOpacity>
      );
    }

    if (status === "in_progress") {
      return (
        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => updateStatus(item.id, "completed")}
        >
          <Text style={styles.primaryText}>Completed</Text>
        </TouchableOpacity>
      );
    }

    return null;
  };

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Technician Requests</Text>

        {message ? (
          <View
            style={[
              styles.messageBox,
              message.type === "error" ? styles.errorBox : styles.successBox,
            ]}
          >
            <Text style={styles.messageTitle}>{message.title}</Text>
            <Text style={styles.messageText}>{message.body}</Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator color="#111" size="large" />
        ) : requests.length === 0 ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>No requests</Text>
            <Text style={styles.emptyText}>
              Your assigned maintenance requests will appear here.
            </Text>
          </View>
        ) : (
          requests.map((item) => (
            <View style={styles.card} key={String(item.id)}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{item.service || "-"}</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{item.status || "-"}</Text>
                </View>
              </View>

              <Text style={styles.info}>
                <Text style={styles.bold}>User:</Text>{" "}
                {item.user_name || item.customer_name || "-"}
              </Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Phone:</Text> {item.user_phone || "-"}
              </Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Date:</Text>{" "}
                {formatDateOnly(item.scheduled_date)}
              </Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Time:</Text>{" "}
                {item.scheduled_time || "-"}
              </Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Created At:</Text>{" "}
                {formatDateTime(item.created_at)}
              </Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Location:</Text>{" "}
                {item.location_note || item.city || "-"}
              </Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Payment:</Text>{" "}
                {item.payment_method || "-"}
              </Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Total:</Text>{" "}
                {Number(item.total_price || 0).toFixed(2)} JOD
              </Text>

              <Text style={styles.description}>
                {item.description || "-"}
              </Text>

              {renderActions(item)}
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DCCF",
  },
  container: {
    padding: 18,
    paddingBottom: 60,
  },
  title: {
    fontSize: 38,
    fontWeight: "900",
    color: "#111",
    marginBottom: 22,
  },
  card: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 26,
    padding: 22,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "flex-start",
    marginBottom: 18,
  },
  cardTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111",
    flex: 1,
  },
  statusPill: {
    backgroundColor: "#111",
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 999,
  },
  statusText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 12,
    textTransform: "lowercase",
  },
  info: {
    fontSize: 17,
    color: "#3A3028",
    marginBottom: 11,
    lineHeight: 24,
  },
  bold: {
    color: "#111",
    fontWeight: "900",
  },
  description: {
    color: "#3A3028",
    fontSize: 17,
    lineHeight: 26,
    marginTop: 10,
    marginBottom: 18,
  },
  actions: {
    flexDirection: "row",
    gap: 10,
    flexWrap: "wrap",
  },
  primaryBtn: {
    backgroundColor: "#111",
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  primaryText: {
    color: "#FFF",
    fontWeight: "900",
  },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#111",
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 6,
  },
  secondaryText: {
    color: "#111",
    fontWeight: "900",
  },
  messageBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  successBox: {
    backgroundColor: "#F5FBF6",
    borderColor: "#CFE8D4",
  },
  errorBox: {
    backgroundColor: "#FFF3F3",
    borderColor: "#EFC3C3",
  },
  messageTitle: {
    fontWeight: "900",
    color: "#111",
    marginBottom: 6,
  },
  messageText: {
    color: "#3A3028",
    lineHeight: 22,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
    marginBottom: 8,
  },
  emptyText: {
    color: "#6B5E52",
    fontSize: 16,
  },
});