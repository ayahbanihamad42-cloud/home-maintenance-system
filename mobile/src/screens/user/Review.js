import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Linking,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import {
  getRequestById,
  cancelMaintenanceRequest,
} from "../../services/maintenanceService";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const Review = ({ route, navigation }) => {
  const requestId = route?.params?.requestId;
  const [request, setRequest] = useState(null);
  const [existingReview, setExistingReview] = useState(null);
  const [rating, setRating] = useState("5");
  const [comment, setComment] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(true);

  const status = useMemo(() => {
    return String(request?.status || "").toLowerCase();
  }, [request]);

  const completed = status === "completed";
  const canReview = completed && !existingReview;

  const canCancel =
    status &&
    ![
      "accepted",
      "confirmed",
      "on_the_way",
      "in_progress",
      "completed",
      "rejected",
      "cancelled",
    ].includes(status);

  const waitingForLocation = status === "accepted" || status === "confirmed";
  const onTheWay = status === "on_the_way";

  const techLat = Number(
    request?.technician_location_lat ||
      request?.technician_lat ||
      request?.current_lat ||
      request?.latitude
  );

  const techLng = Number(
    request?.technician_location_lng ||
      request?.technician_lng ||
      request?.current_lng ||
      request?.longitude
  );

  const hasTechLocation = Number.isFinite(techLat) && Number.isFinite(techLng);

  const formatDate = (value) => {
    if (!value) return "-";
    const raw = String(value);
    const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : raw.slice(0, 10);
  };

  const formatTime = (value) => {
    if (!value) return "-";
    return String(value).slice(0, 8);
  };

  const load = async (silent = false) => {
    try {
      if (!silent) setLoading(true);

      const data = await getRequestById(requestId);
      setRequest(data || null);

      try {
        const reviewRes = await API.get(`/ratings/request/${requestId}`);
        setExistingReview(reviewRes.data || null);
      } catch {
        setExistingReview(null);
      }
    } catch {
      setRequest(null);
      setMessage({
        type: "error",
        text: "Failed to load request details.",
      });
    } finally {
      if (!silent) setLoading(false);
    }
  };

  useEffect(() => {
    if (!requestId) return;

    load(false);

    const timer = setInterval(() => {
      load(true);
    }, 8000);

    return () => clearInterval(timer);
  }, [requestId]);

  const cancelRequest = async () => {
    try {
      setMessage(null);

      await cancelMaintenanceRequest(requestId);

      setMessage({
        type: "success",
        text: "Request cancelled successfully.",
      });

      await load(true);

      setTimeout(() => navigation.navigate("MaintenanceHistory"), 800);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to cancel request. This request may no longer be cancellable.",
      });
    }
  };

  const submit = async () => {
    if (!completed) {
      setMessage({
        type: "error",
        text: "Rating appears only after the request is completed.",
      });
      return;
    }

    if (existingReview) {
      setMessage({
        type: "error",
        text: "You already reviewed this request.",
      });
      return;
    }

    if (!comment.trim()) {
      setMessage({
        type: "error",
        text: "Please enter a comment.",
      });
      return;
    }

    const rate = Number(rating);

    if (!rate || rate < 1 || rate > 5) {
      setMessage({
        type: "error",
        text: "Rating must be between 1 and 5.",
      });
      return;
    }

    try {
      await API.post("/ratings", {
        request_id: Number(requestId),
        technician_id: request?.technician_id,
        rating: rate,
        comment: comment.trim(),
      });

      setExistingReview({ rating: rate, comment: comment.trim() });

      setMessage({
        type: "success",
        text: "Review submitted successfully.",
      });

      setTimeout(() => navigation.navigate("MaintenanceHistory"), 800);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to submit review.",
      });
    }
  };

  const openLocation = () => {
    if (!hasTechLocation) return;

    Linking.openURL(`https://www.google.com/maps?q=${techLat},${techLng}`);
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Review" />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Request Details</Text>
          <Text style={appStyles.heroSubtitle}>
            View request information and submit a review after completion.
          </Text>
        </View>

        {message ? (
          <View
            style={
              message.type === "success"
                ? appStyles.successBox
                : appStyles.errorBox
            }
          >
            <Text
              style={
                message.type === "success"
                  ? appStyles.successText
                  : appStyles.errorText
              }
            >
              {message.text}
            </Text>
          </View>
        ) : null}

        {loading ? (
          <View style={appStyles.card}>
            <Text style={appStyles.text}>Loading request...</Text>
          </View>
        ) : !request ? (
          <View style={appStyles.card}>
            <Text style={appStyles.sectionTitle}>No request found</Text>
          </View>
        ) : (
          <>
            <View style={appStyles.card}>
              <View style={appStyles.between}>
                <Text style={appStyles.sectionTitle}>
                  {request.service || "Request"}
                </Text>

                <View style={appStyles.statusBadge}>
                  <Text style={appStyles.statusText}>
                    {String(request.status || "-").replaceAll("_", " ")}
                  </Text>
                </View>
              </View>

              <Text style={appStyles.text}>
                Description: {request.description || "-"}
              </Text>

              <Text style={appStyles.text}>
                Technician: {request.technician_name || "-"}
              </Text>

              <Text style={appStyles.text}>
                Date: {formatDate(request.scheduled_date)}
              </Text>

              <Text style={appStyles.text}>
                Time: {formatTime(request.scheduled_time)}
              </Text>

              <Text style={appStyles.text}>
                Payment: {request.payment_method || "-"}
              </Text>

              <Text style={appStyles.text}>
                Amount:{" "}
                {Number(request.total_price || request.amount || 0).toFixed(2)}{" "}
                JOD
              </Text>

              <Text style={appStyles.text}>
                Location Note: {request.location_note || request.city || "-"}
              </Text>

              {canCancel && (
                <TouchableOpacity
                  style={appStyles.dangerBtn}
                  onPress={cancelRequest}
                >
                  <Text style={appStyles.dangerBtnText}>Cancel Request</Text>
                </TouchableOpacity>
              )}
            </View>

            {waitingForLocation && (
              <View style={appStyles.successBox}>
                <Text style={appStyles.successText}>
                  The technician location will appear here when the status
                  becomes On The Way.
                </Text>
              </View>
            )}

            {onTheWay && hasTechLocation && (
              <View style={appStyles.card}>
                <Text style={appStyles.sectionTitle}>
                  Technician Live Location
                </Text>

                <MapView
                  style={{
                    width: "100%",
                    height: 260,
                    borderRadius: 22,
                    overflow: "hidden",
                  }}
                  initialRegion={{
                    latitude: techLat,
                    longitude: techLng,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                >
                  <Marker
                    coordinate={{ latitude: techLat, longitude: techLng }}
                    title="Technician Location"
                  />
                </MapView>

                <TouchableOpacity
                  style={appStyles.secondaryBtn}
                  onPress={openLocation}
                >
                  <Text style={appStyles.secondaryBtnText}>
                    Open in Google Maps
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {onTheWay && !hasTechLocation && (
              <View style={appStyles.errorBox}>
                <Text style={appStyles.errorText}>
                  Technician status is On The Way, but the live location has not
                  been received yet.
                </Text>
              </View>
            )}

            {!completed && (
              <View style={appStyles.warningBox}>
                <Text style={appStyles.warningText}>
                  Rating appears only after the request status becomes
                  completed.
                </Text>
              </View>
            )}

            {existingReview && (
              <View style={appStyles.successBox}>
                <Text style={appStyles.successText}>
                  Already reviewed. Rating: {existingReview.rating} | Comment:{" "}
                  {existingReview.comment || "-"}
                </Text>
              </View>
            )}

            {canReview && (
              <View style={appStyles.card}>
                <Text style={appStyles.sectionTitle}>Submit Review</Text>

                <Text style={appStyles.label}>Rating</Text>
                <TextInput
                  style={appStyles.input}
                  value={rating}
                  onChangeText={setRating}
                  keyboardType="numeric"
                  placeholder="1 - 5"
                  maxLength={1}
                />

                <Text style={appStyles.label}>Comment</Text>
                <TextInput
                  style={[appStyles.input, appStyles.textArea]}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  placeholder="Write your review..."
                />

                <TouchableOpacity style={appStyles.primaryBtn} onPress={submit}>
                  <Text style={appStyles.primaryBtnText}>Submit Review</Text>
                </TouchableOpacity>
              </View>
            )}
          </>
        )}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
};

export default Review;