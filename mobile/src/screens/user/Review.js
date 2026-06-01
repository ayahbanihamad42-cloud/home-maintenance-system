import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TextInput, TouchableOpacity } from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const Review = ({ route, navigation }) => {
  const requestId = route?.params?.requestId;
  const [request, setRequest] = useState(null);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState("");

  const completed = useMemo(() => String(request?.status || "").toLowerCase() === "completed", [request]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get(`/maintenance/${requestId}`);
        setRequest(res.data);
      } catch {
        setRequest(null);
      }
    };
    load();
  }, [requestId]);

  const submit = async () => {
    if (!completed) {
      setMessage("Rating appears only after completed.");
      return;
    }

    try {
      await API.post("/ratings", {
        request_id: requestId,
        technician_id: request?.technician_id,
        rating: Number(rating),
        comment,
      });
      setMessage("Review submitted successfully.");
      setTimeout(() => navigation.navigate("MaintenanceHistory"), 800);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to submit review.");
    }
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Review" />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Request Details</Text>
          <Text style={appStyles.heroSubtitle}>Review appears after completion.</Text>
        </View>

        {message ? (
          <View style={message.includes("success") ? appStyles.successBox : appStyles.errorBox}>
            <Text style={message.includes("success") ? appStyles.successText : appStyles.errorText}>{message}</Text>
          </View>
        ) : null}

        <View style={appStyles.card}>
          <Text style={appStyles.sectionTitle}>{request?.service || "Request"}</Text>
          <Text style={appStyles.text}>Status: {request?.status || "-"}</Text>
          <Text style={appStyles.text}>Technician: {request?.technician_name || "-"}</Text>
          <Text style={appStyles.text}>Date: {String(request?.scheduled_date || "").slice(0, 10)}</Text>
          <Text style={appStyles.text}>Time: {String(request?.scheduled_time || "").slice(0, 8)}</Text>
          <Text style={appStyles.text}>Payment: {request?.payment_method || "-"}</Text>
          <Text style={appStyles.text}>Amount: {Number(request?.total_price || request?.amount || 0).toFixed(2)} JOD</Text>
        </View>

        {completed && (
          <View style={appStyles.card}>
            <Text style={appStyles.label}>Rating</Text>
            <TextInput style={appStyles.input} value={rating} onChangeText={setRating} keyboardType="numeric" />

            <Text style={appStyles.label}>Comment</Text>
            <TextInput
              style={[appStyles.input, appStyles.textArea]}
              value={comment}
              onChangeText={setComment}
              multiline
            />

            <TouchableOpacity style={appStyles.primaryBtn} onPress={submit}>
              <Text style={appStyles.primaryBtnText}>Submit Review</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
};

export default Review;