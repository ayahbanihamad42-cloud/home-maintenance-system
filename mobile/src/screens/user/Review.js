import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Header from "../../components/Common/Header";
import API from "../../services/api";
import { getRequestById } from "../../services/maintenanceService";
import { getRatingByRequest, submitRating } from "../../services/ratingService";

export default function Review({ navigation, route }) {
  const requestId = route?.params?.requestId;
  const passedRequest = route?.params?.request || null;

  const [req, setReq] = useState(passedRequest);
  const [loading, setLoading] = useState(!passedRequest);
  const [message, setMessage] = useState(null);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [existingRating, setExistingRating] = useState(null);

  const formatDate = (value) => {
    if (!value) return "-";
    return String(value).split("T")[0];
  };

  const formatTime = (value) => {
    if (!value) return "-";
    return String(value).slice(0, 8);
  };

  const loadRequest = async () => {
    try {
      setLoading(true);
      const data = await getRequestById(requestId);
      setReq(data);
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to load request.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadRating = async () => {
    try {
      const data = await getRatingByRequest(requestId);
      if (data) {
        setExistingRating(data);
        setRating(data.rating || 5);
        setComment(data.comment || "");
      }
    } catch {
      setExistingRating(null);
    }
  };

  useEffect(() => {
    if (requestId && !passedRequest) loadRequest();
    if (requestId) loadRating();
  }, [requestId]);

  const canCancel = ["pending"].includes(
    String(req?.status || "").toLowerCase()
  );

  const isCompleted =
    String(req?.status || "").toLowerCase() === "completed";

  const cancelRequest = async () => {
    try {
      if (!canCancel) {
        Alert.alert(
          "Not Available",
          "You can cancel only before the technician accepts the request."
        );
        return;
      }

      await API.put(`/maintenance/${req.id}/status`, {
        status: "cancelled",
      });

      setMessage({
        type: "success",
        title: "Cancelled Successfully",
        body:
          String(req.payment_method).toLowerCase() === "online"
            ? "Request cancelled. Refund notification has been sent."
            : "Request cancelled successfully.",
      });

      setReq((prev) => ({
        ...prev,
        status: "cancelled",
      }));
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to cancel request.",
      });
    }
  };

  const sendReview = async () => {
    try {
      if (!req?.technician_id) return;

      await submitRating({
        technician_id: req.technician_id,
        request_id: req.id,
        rating,
        comment,
      });

      setExistingRating({ rating, comment });
      setMessage({
        type: "success",
        title: "Review Submitted",
        body: "Thank you for your feedback.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to submit review.",
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <Header />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#111" />
        </View>
      </View>
    );
  }

  if (!req) {
    return (
      <View style={styles.screen}>
        <Header />
        <View style={styles.center}>
          <Text style={styles.emptyText}>Request not found.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.panel}>
          <Text style={styles.title}>Request Review</Text>

          {message ? (
            <View
              style={[
                styles.messageBox,
                message.type === "success" && styles.successBox,
                message.type === "error" && styles.errorBox,
              ]}
            >
              <Text style={styles.messageTitle}>{message.title}</Text>
              <Text style={styles.messageBody}>{message.body}</Text>
            </View>
          ) : null}

          <View style={styles.card}>
            <View style={styles.cardTop}>
              <Text style={styles.service}>
                {req.service || req.service_type || "Maintenance"}
              </Text>
              <Text style={styles.badge}>{req.status || "-"}</Text>
            </View>

            <Text style={styles.desc}>{req.description || "No description"}</Text>

            <View style={styles.infoGrid}>
              <Text style={styles.line}>
                Date: {formatDate(req.scheduled_date)}
              </Text>
              <Text style={styles.line}>
                Time: {formatTime(req.scheduled_time)}
              </Text>
              <Text style={styles.line}>
                Technician: {req.technician_name || req.technician_id || "-"}
              </Text>
              <Text style={styles.line}>
                Location: {req.location_note || req.location || req.city || "-"}
              </Text>
              <Text style={styles.line}>
                Payment: {req.payment_method || "-"}
              </Text>
              <Text style={styles.line}>
                Total: {Number(req.total_price || req.total || 0).toFixed(2)} JOD
              </Text>
              <Text style={styles.line}>
                Created Date: {formatDate(req.created_at)}
              </Text>
              <Text style={styles.line}>
                Created Time: {formatTime(req.created_at?.split("T")?.[1])}
              </Text>
            </View>

            {canCancel ? (
              <TouchableOpacity style={styles.outlineBtn} onPress={cancelRequest}>
                <Text style={styles.outlineBtnText}>Cancel Request</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.note}>
                Cancellation is available only before the technician accepts the request.
              </Text>
            )}
          </View>

          {isCompleted ? (
            <View style={styles.reviewBox}>
              <Text style={styles.sectionTitle}>Rate your experience</Text>

              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={rating}
                  enabled={!existingRating}
                  onValueChange={setRating}
                >
                  <Picker.Item label="5 Stars" value={5} />
                  <Picker.Item label="4 Stars" value={4} />
                  <Picker.Item label="3 Stars" value={3} />
                  <Picker.Item label="2 Stars" value={2} />
                  <Picker.Item label="1 Star" value={1} />
                </Picker>
              </View>

              <TextInput
                style={styles.textArea}
                value={comment}
                onChangeText={setComment}
                editable={!existingRating}
                multiline
                placeholder="Leave a comment..."
              />

              <TouchableOpacity
                style={[styles.primaryBtn, existingRating && { opacity: 0.5 }]}
                disabled={!!existingRating}
                onPress={sendReview}
              >
                <Text style={styles.primaryBtnText}>
                  {existingRating ? "Review Submitted" : "Submit Review"}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.note}>
              Review is available only after the request is completed.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e7dccc" },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  container: { padding: 24, paddingBottom: 70 },
  panel: {
    backgroundColor: "#fffaf4",
    borderRadius: 28,
    padding: 26,
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  title: { fontSize: 36, fontWeight: "900", marginBottom: 20 },
  messageBox: {
    padding: 14,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  successBox: { backgroundColor: "#eef9f1", borderColor: "#bfe7ca" },
  errorBox: { backgroundColor: "#fdebed", borderColor: "#efb6bd" },
  messageTitle: { fontWeight: "900", fontSize: 16 },
  messageBody: { marginTop: 6, fontSize: 15, color: "#6b5e52" },
  card: {
    backgroundColor: "#f7efe7",
    borderRadius: 24,
    padding: 22,
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  service: { fontSize: 26, fontWeight: "900", flex: 1 },
  badge: {
    backgroundColor: "#111",
    color: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    overflow: "hidden",
    fontWeight: "900",
  },
  desc: { fontSize: 17, marginVertical: 18, color: "#3d342d" },
  infoGrid: { gap: 8 },
  line: { fontSize: 16, color: "#3d342d", fontWeight: "600" },
  outlineBtn: {
    alignSelf: "flex-start",
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#111",
  },
  outlineBtnText: { color: "#111", fontWeight: "900" },
  note: { marginTop: 18, color: "#6b5e52", fontSize: 15, lineHeight: 22 },
  reviewBox: { marginTop: 22 },
  sectionTitle: { fontSize: 22, fontWeight: "900", marginBottom: 12 },
  pickerBox: {
    backgroundColor: "#f7efe7",
    borderWidth: 1,
    borderColor: "#d8c8b8",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 12,
  },
  textArea: {
    backgroundColor: "#f7efe7",
    borderWidth: 1,
    borderColor: "#d8c8b8",
    borderRadius: 16,
    padding: 14,
    height: 100,
    textAlignVertical: "top",
    fontSize: 16,
  },
  primaryBtn: {
    backgroundColor: "#111",
    alignSelf: "flex-start",
    marginTop: 14,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 16,
  },
  primaryBtnText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  emptyText: { fontSize: 18, color: "#6b5e52" },
});