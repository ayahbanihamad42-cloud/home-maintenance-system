import React, { useEffect, useMemo, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput, 
  SafeAreaView,
  ActivityIndicator
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";

import { getRequestById } from "../../services/maintenanceService";
import { getRatingByRequest, submitRating } from "../../services/ratingService";
import Header from "../../components/common/Header";
import API from "../../services/api";

function ReviewRequest() {
  const route = useRoute();
  const navigation = useNavigation();
  const { requestId } = route.params;

  const [req, setReq] = useState(null);
  const [technicianName, setTechnicianName] = useState("");
  const [technicianUserId, setTechnicianUserId] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submitMessage, setSubmitMessage] = useState("");
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    getRequestById(requestId)
      .then((data) => setReq(data))
      .catch(() => setReq(null));
  }, [requestId]);

  useEffect(() => {
    getRatingByRequest(requestId)
      .then((data) => {
        if (data) {
          setExistingRating(data);
          setRating(data.rating);
          setComment(data.comment || "");
        }
      })
      .catch(() => setExistingRating(null));
  }, [requestId]);

  useEffect(() => {
    if (!req?.technician_id) return;

    API.get(`/technicians/${req.technician_id}`)
      .then((res) => {
        setTechnicianName(res.data?.name || "");
        setTechnicianUserId(res.data?.user_id || null);
      })
      .catch(() => {
        setTechnicianName("");
        setTechnicianUserId(null);
      });
  }, [req?.technician_id]);

  const timelineSteps = useMemo(
    () => ["Request Accepted", "On The Way", "Service in Progress", "Completed"],
    []
  );

  const activeIndex = useMemo(() => {
    const statusMap = {
      pending: -1,
      confirmed: 0,
      on_the_way: 1,
      in_progress: 2,
      completed: 3
    };
    const normalizedStatus = String(req?.status || "").trim().toLowerCase();
    return statusMap[normalizedStatus] ?? -1;
  }, [req?.status]);

  const isCompleted = String(req?.status || "").trim().toLowerCase() === "completed";

  const handleSubmitRating = () => {
    if (!req?.technician_id) return;

    submitRating({
      technician_id: req.technician_id,
      request_id: req.id,
      rating,
      comment
    })
      .then(() => {
        setSubmitMessage("Review submitted.");
        setExistingRating({ rating, comment });
      })
      .catch(() => {
        setSubmitMessage("Failed to submit review.");
      });
  };

  if (!req) {
    return (
      <SafeAreaView style={styles.container}>
        <Header />
        <View style={styles.centered}><ActivityIndicator size="large" color="#007AFF" /></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.glassCard}>
          <Text style={styles.cardTitle}>Request ID: #{req.id}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Service Type:</Text> {req.service || "Not specified"}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Date:</Text> {req.scheduled_date || "Not specified"}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Time:</Text> {req.scheduled_time || "Not specified"}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Location:</Text> {req.location_note || "Not specified"}</Text>
          <Text style={styles.infoText}><Text style={styles.bold}>Description:</Text> {req.description || "Not specified"}</Text>

          <View style={styles.technicianBar}>
            <Text style={styles.technicianText}>👤 Technician: {technicianName || "Assigned technician"}</Text>
            <TouchableOpacity 
              style={styles.chatButton}
              onPress={() => {
                if (technicianUserId) {
                  navigation.navigate("Chat", { userId: technicianUserId });
                } else {
                  setSubmitMessage("Chat will be available once a technician is assigned.");
                }
              }}
            >
              <Text style={styles.chatButtonText}>Chat</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.timeline}>
            {timelineSteps.map((step, index) => (
              <View key={step} style={styles.timelineItem}>
                <View style={[styles.dot, activeIndex >= index && styles.activeDot]} />
                <Text style={[styles.stepText, activeIndex >= index && styles.activeStepText]}>{step}</Text>
              </View>
            ))}
          </View>

          {isCompleted ? (
            <View style={styles.ratingSection}>
              <Text style={styles.ratingTitle}>Rate your experience:</Text>
              
              <View style={styles.pickerContainer}>
                <Picker
                  selectedValue={rating}
                  enabled={!existingRating}
                  onValueChange={(val) => setRating(val)}
                >
                  {[5, 4, 3, 2, 1].map((v) => (
                    <Picker.Item key={v} label={`${v} Stars`} value={v} />
                  ))}
                </Picker>
              </View>

              <TextInput
                style={styles.textArea}
                placeholder="Leave a comment..."
                multiline
                numberOfLines={4}
                value={comment}
                editable={!existingRating}
                onChangeText={setComment}
              />

              {submitMessage ? <Text style={styles.messageText}>{submitMessage}</Text> : null}

              <TouchableOpacity 
                style={[styles.submitButton, existingRating && styles.disabledButton]}
                disabled={!!existingRating}
                onPress={handleSubmitRating}
              >
                <Text style={styles.submitButtonText}>Submit Review</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={styles.footerNote}>You can rate the service after it is marked as Completed.</Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 15 },
  glassCard: { backgroundColor: "#fff", padding: 20, borderRadius: 15, elevation: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 10 },
  cardTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  infoText: { fontSize: 14, marginBottom: 5 },
  bold: { fontWeight: "bold" },
  technicianBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#cfd8dc", padding: 12, borderRadius: 10, marginVertical: 15 },
  technicianText: { flex: 1, fontSize: 14 },
  chatButton: { backgroundColor: "#007AFF", paddingVertical: 6, paddingHorizontal: 15, borderRadius: 5 },
  chatButtonText: { color: "#fff", fontWeight: "600" },
  timeline: { marginVertical: 15 },
  timelineItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  dot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#ddd", marginRight: 10 },
  activeDot: { backgroundColor: "#007AFF" },
  stepText: { color: "#888", fontSize: 13 },
  activeStepText: { color: "#000", fontWeight: "bold" },
  ratingSection: { marginTop: 20 },
  ratingTitle: { textAlign: "center", marginBottom: 10, fontSize: 16 },
  pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, marginBottom: 10 },
  textArea: { borderWidth: 1, borderColor: "#ccc", borderRadius: 10, padding: 10, height: 80, textAlignVertical: "top" },
  messageText: { color: "#007AFF", textAlign: "center", marginVertical: 10 },
  submitButton: { backgroundColor: "#007AFF", padding: 15, borderRadius: 10, marginTop: 10, alignItems: "center" },
  disabledButton: { backgroundColor: "#ccc" },
  submitButtonText: { color: "#fff", fontWeight: "bold" },
  footerNote: { textAlign: "center", marginTop: 20, color: "#666" }
});

export default ReviewRequest;
