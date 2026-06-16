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
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import {
  getRequestById,
  cancelMaintenanceRequest,
} from "../../services/maintenanceService";
import API from "../../services/api";
import { getStyles } from "../../styles/mobileStyles";
import HeroSection from "../../components/Common/HeroSection";

const Review = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { c } = useTheme();
  const appStyles = getStyles(c);

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
        text: t("review.errors.loadFailed"),
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
        text: t("review.cancelSuccess"),
      });

      await load(true);

      setTimeout(() => navigation.navigate("MaintenanceHistory"), 800);
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          t("review.errors.cancelFailed"),
      });
    }
  };

  const submit = async () => {
    if (!completed) {
      setMessage({
        type: "error",
        text: t("review.errors.notCompleted"),
      });
      return;
    }

    if (existingReview) {
      setMessage({
        type: "error",
        text: t("review.errors.alreadyReviewed"),
      });
      return;
    }

    if (!comment.trim()) {
      setMessage({
        type: "error",
        text: t("review.errors.enterComment"),
      });
      return;
    }

    const rate = Number(rating);

    if (!rate || rate < 1 || rate > 5) {
      setMessage({
        type: "error",
        text: t("review.errors.ratingRange"),
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
        text: t("review.submitSuccess"),
      });

      setTimeout(() => navigation.navigate("MaintenanceHistory"), 800);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || t("review.errors.submitFailed"),
      });
    }
  };

  const openLocation = () => {
    if (!hasTechLocation) return;

    Linking.openURL(`https://www.google.com/maps?q=${techLat},${techLng}`);
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title={t("review.headerTitle")} />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection
          title={t("review.title")}
          subtitle={t("review.subtitle")}
        />


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
            <Text style={appStyles.text}>{t("review.loading")}</Text>
          </View>
        ) : !request ? (
          <View style={appStyles.card}>
            <Text style={appStyles.sectionTitle}>{t("review.noRequest")}</Text>
          </View>
        ) : (
          <>
            <View style={appStyles.card}>
              <View style={appStyles.between}>
                <Text style={appStyles.sectionTitle}>
                  {request.service || t("review.request")}
                </Text>

                <View style={appStyles.statusBadge}>
                  <Text style={appStyles.statusText}>
                    {String(request.status || "-").replaceAll("_", " ")}
                  </Text>
                </View>
              </View>

              <Text style={appStyles.text}>
                {t("review.description")}: {request.description || "-"}
              </Text>

              <Text style={appStyles.text}>
                {t("review.technician")}: {request.technician_name || "-"}
              </Text>

              <Text style={appStyles.text}>
                {t("review.date")}: {formatDate(request.scheduled_date)}
              </Text>

              <Text style={appStyles.text}>
                {t("review.time")}: {formatTime(request.scheduled_time)}
              </Text>

              <Text style={appStyles.text}>
                {t("review.payment")}: {request.payment_method || "-"}
              </Text>

              <Text style={appStyles.text}>
                {t("review.amount")}:{" "}
                {Number(request.total_price || request.amount || 0).toFixed(2)}{" "}
                JOD
              </Text>

              <Text style={appStyles.text}>
                {t("review.locationNote")}: {request.location_note || request.city || "-"}
              </Text>

              {canCancel && (
                <TouchableOpacity
                  style={appStyles.dangerBtn}
                  onPress={cancelRequest}
                >
                  <Text style={appStyles.dangerBtnText}>{t("review.cancelRequest")}</Text>
                </TouchableOpacity>
              )}
            </View>

            {waitingForLocation && (
              <View style={appStyles.successBox}>
                <Text style={appStyles.successText}>
                  {t("review.waitingForLocation")}
                </Text>
              </View>
            )}

            {onTheWay && hasTechLocation && (
              <View style={appStyles.card}>
                <Text style={appStyles.sectionTitle}>
                  {t("review.techLiveLocation")}
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
                    title={t("review.techLocationMarker")}
                  />
                </MapView>

                <TouchableOpacity
                  style={appStyles.secondaryBtn}
                  onPress={openLocation}
                >
                  <Text style={appStyles.secondaryBtnText}>
                    {t("review.openInMaps")}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {onTheWay && !hasTechLocation && (
              <View style={appStyles.errorBox}>
                <Text style={appStyles.errorText}>
                  {t("review.noLiveLocation")}
                </Text>
              </View>
            )}

            {!completed && (
              <View style={appStyles.warningBox}>
                <Text style={appStyles.warningText}>
                  {t("review.ratingAfterComplete")}
                </Text>
              </View>
            )}

            {existingReview && (
              <View style={appStyles.successBox}>
                <Text style={appStyles.successText}>
                  {t("review.alreadyReviewed", { rating: existingReview.rating, comment: existingReview.comment || "-" })}
                </Text>
              </View>
            )}

            {canReview && (
              <View style={appStyles.card}>
                <Text style={appStyles.sectionTitle}>{t("review.submitReview")}</Text>

                <Text style={appStyles.label}>{t("review.ratingLabel")}</Text>
                <TextInput
                  style={appStyles.input}
                  value={rating}
                  onChangeText={setRating}
                  keyboardType="numeric"
                  placeholder="1 - 5"
                  maxLength={1}
                />

                <Text style={appStyles.label}>{t("review.commentLabel")}</Text>
                <TextInput
                  style={[appStyles.input, appStyles.textArea]}
                  value={comment}
                  onChangeText={setComment}
                  multiline
                  placeholder={t("review.commentPlaceholder")}
                />

                <TouchableOpacity style={appStyles.primaryBtn} onPress={submit}>
                  <Text style={appStyles.primaryBtnText}>{t("review.submitReview")}</Text>
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
