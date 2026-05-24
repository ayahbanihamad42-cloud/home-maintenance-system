import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
} from "react-native";
import Header from "../../components/Common/Header";
import {
  getRequestById,
  cancelMaintenanceRequest,
} from "../../services/maintenanceService";
import { addRating, getRatingByRequest } from "../../services/ratingService";

const formatDateOnly = (value) => {
  if (!value) return "-";

  const raw = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  if (raw.includes("T")) {
    const date = new Date(raw);

    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Amman",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    }
  }

  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  return raw.slice(0, 10);
};

const formatDateTime = (value) => {
  if (!value) return "-";

  const raw = String(value).trim();

  if (!raw.includes("T")) return raw;

  const date = new Date(raw);

  if (Number.isNaN(date.getTime())) return raw;

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Amman",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

export default function Review({ navigation, route }) {
  const requestId = route?.params?.requestId || route?.params?.id;

  const [request, setRequest] = useState(route?.params?.request || null);
  const [oldRating, setOldRating] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadRequest = async () => {
    if (!requestId) {
      setMessage({
        type: "error",
        title: "Error",
        body: "Request id is missing.",
      });
      return;
    }

    try {
      setRefreshing(true);
      setMessage(null);

      const data = await getRequestById(requestId);
      setRequest(data || route?.params?.request || null);

      const ratingData = await getRatingByRequest(requestId).catch(() => null);
      setOldRating(ratingData || null);

      if (ratingData) {
        setRating(ratingData.rating || 5);
        setComment(ratingData.comment || "");
      }
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to load request.",
      });
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadRequest();
  }, [requestId]);

  const status = String(request?.status || "").toLowerCase();
  const canCancel = status === "pending";
  const canReview = status === "completed";

  const handleCancel = async () => {
    try {
      await cancelMaintenanceRequest(requestId);

      setMessage({
        type: "success",
        title: "Cancelled",
        body: "Request cancelled successfully.",
      });

      await loadRequest();
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body:
          err?.response?.data?.message ||
          "This request cannot be cancelled now.",
      });
    }
  };

  const submitRating = async () => {
    try {
      if (!request?.technician_id) {
        setMessage({
          type: "error",
          title: "Error",
          body: "Technician id is missing.",
        });
        return;
      }

      await addRating({
        technician_id: request.technician_id,
        request_id: request.id || requestId,
        rating,
        comment,
      });

      setMessage({
        type: "success",
        title: "Saved",
        body: "Review submitted successfully.",
      });

      await loadRequest();
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to submit review.",
      });
    }
  };

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Request Review</Text>

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

        {!request ? (
          <View style={styles.card}>
            <Text style={styles.emptyTitle}>Request not found</Text>
            <Text style={styles.emptyText}>
              {refreshing ? "Loading request..." : "Please go back and try again."}
            </Text>

            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => navigation.navigate("MaintenanceHistory")}
            >
              <Text style={styles.secondaryText}>Back to History</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.cardTitle}>{request.service || "-"}</Text>
                <View style={styles.statusPill}>
                  <Text style={styles.statusText}>{request.status || "-"}</Text>
                </View>
              </View>

              <Text style={styles.description}>{request.description || "-"}</Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Date:</Text>{" "}
                {formatDateOnly(request.scheduled_date)}
              </Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Time:</Text>{" "}
                {request.scheduled_time || "-"}
              </Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Created At:</Text>{" "}
                {formatDateTime(request.created_at)}
              </Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Technician:</Text>{" "}
                {request.technician_name || "-"}
              </Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Location:</Text>{" "}
                {request.location_note || request.city || "-"}
              </Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Payment:</Text>{" "}
                {request.payment_method || "-"}
              </Text>

              <Text style={styles.info}>
                <Text style={styles.bold}>Total:</Text>{" "}
                {Number(request.total_price || 0).toFixed(2)} JOD
              </Text>

              <View style={styles.actionRow}>
                {canCancel ? (
                  <TouchableOpacity
                    style={styles.secondaryBtn}
                    onPress={handleCancel}
                  >
                    <Text style={styles.secondaryText}>Cancel Request</Text>
                  </TouchableOpacity>
                ) : null}

                <TouchableOpacity
                  style={styles.primaryBtnSmall}
                  onPress={() => navigation.navigate("MaintenanceHistory")}
                >
                  <Text style={styles.primaryText}>Back to History</Text>
                </TouchableOpacity>
              </View>
            </View>

            {!canReview ? (
              <View style={styles.card}>
                <Text style={styles.emptyText}>
                  Review is available only after the request is completed.
                </Text>
              </View>
            ) : oldRating ? (
              <View style={[styles.card, styles.successBox]}>
                <Text style={styles.emptyTitle}>Already Reviewed</Text>
                <Text style={styles.emptyText}>
                  Your rating: {oldRating.rating} ⭐
                </Text>
                <Text style={styles.emptyText}>
                  {oldRating.comment || "No comment."}
                </Text>
              </View>
            ) : (
              <View style={styles.card}>
                <Text style={styles.emptyTitle}>Rate Technician</Text>

                <View style={styles.starsRow}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <TouchableOpacity key={star} onPress={() => setRating(star)}>
                      <Text
                        style={[
                          styles.star,
                          star <= rating && styles.activeStar,
                        ]}
                      >
                        ★
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Comment</Text>
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  placeholder="Write your review..."
                />

                <TouchableOpacity style={styles.primaryBtn} onPress={submitRating}>
                  <Text style={styles.primaryText}>Submit Review</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E8DCCF" },
  container: { padding: 18, paddingBottom: 70 },
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
    marginBottom: 16,
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
  description: {
    color: "#3A3028",
    fontSize: 17,
    lineHeight: 26,
    marginBottom: 18,
  },
  info: {
    fontSize: 17,
    color: "#3A3028",
    marginBottom: 11,
    lineHeight: 24,
  },
  bold: { color: "#111", fontWeight: "900" },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginTop: 8,
  },
  primaryBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignItems: "center",
    marginTop: 12,
  },
  primaryBtnSmall: {
    backgroundColor: "#111",
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  primaryText: { color: "#FFF", fontWeight: "900" },
  secondaryBtn: {
    borderWidth: 1,
    borderColor: "#111",
    paddingVertical: 13,
    paddingHorizontal: 22,
    borderRadius: 999,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  secondaryText: { color: "#111", fontWeight: "900" },
  messageBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  successBox: { backgroundColor: "#F5FBF6", borderColor: "#CFE8D4" },
  errorBox: { backgroundColor: "#FFF3F3", borderColor: "#EFC3C3" },
  messageTitle: { fontWeight: "900", color: "#111", marginBottom: 6 },
  messageText: { color: "#3A3028", lineHeight: 22 },
  emptyTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
    marginBottom: 8,
  },
  emptyText: { color: "#6B5E52", fontSize: 16, lineHeight: 24 },
  starsRow: { flexDirection: "row", gap: 8, marginVertical: 14 },
  star: { fontSize: 36, color: "#C8B8A8" },
  activeStar: { color: "#111" },
  label: {
    color: "#111",
    fontWeight: "900",
    marginBottom: 8,
    fontSize: 16,
  },
  input: {
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 14,
    padding: 12,
    color: "#111",
  },
  textArea: { minHeight: 110, textAlignVertical: "top" },
});