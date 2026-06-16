import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Linking,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import CustomDropdown from "../../components/Common/CustomDropdown";
import API from "../../services/api";
import { getStyles } from "../../styles/mobileStyles";

function MaintenanceRequest({ route, navigation }) {
  const { t } = useTranslation();
  const { c } = useTheme();
  const appStyles = getStyles(c);

  const params = route?.params || {};
  const stateTech = params.technician || params.tech || {};

  const selectedTechnicianId =
    params.technicianId ||
    params.technician_id ||
    stateTech.technicianId ||
    stateTech.technician_id ||
    stateTech.id ||
    "";

  const [user, setUser] = useState({});
  const [availableTimes, setAvailableTimes] = useState([]);
  const [message, setMessage] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [timesLoading, setTimesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    service: params.service || stateTech.service || "",
    technician_name:
      params.technicianName || params.technician_name || stateTech.name || "",
    scheduled_date: "",
    scheduled_time: "",
    estimated_hours: "1",
    payment_method: "cash",
    location_note: "",
    description: "",
    price_per_hour: params.price_per_hour || stateTech.price_per_hour || 0,
  });

  const totalPrice = useMemo(() => {
    const price = Number(form.price_per_hour || 0);
    const hours = Math.max(Number(form.estimated_hours || 1), 1);
    return Number((price * hours).toFixed(2));
  }, [form.price_per_hour, form.estimated_hours]);

  const dateOptions = useMemo(() => {
    const result = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < 45; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);

      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      const value = `${yyyy}-${mm}-${dd}`;

      result.push({ label: value, value });
    }

    return result;
  }, []);

  const normalizeDate = (value) => {
    if (!value) return "";
    const match = String(value).match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : String(value).slice(0, 10);
  };

  const normalizeTime = (value) => {
    if (!value) return "";
    const raw = String(value).trim();
    if (/^\d{2}:\d{2}$/.test(raw)) return `${raw}:00`;
    if (/^\d{2}:\d{2}:\d{2}$/.test(raw)) return raw;
    return raw.slice(0, 8);
  };

  const shortTime = (value) => String(value || "").slice(0, 5);

  const isBooked = (item) =>
    Number(item?.is_booked) === 1 ||
    item?.is_booked === true ||
    String(item?.is_booked).toLowerCase() === "true";

  const loadUser = async () => {
    const raw = await AsyncStorage.getItem("user");
    setUser(raw ? JSON.parse(raw) : {});
  };

  const loadTechnician = async () => {
    try {
      if (!selectedTechnicianId) return;

      const res = await API.get(`/technicians/${selectedTechnicianId}`);
      const tech = res.data || {};

      setForm((prev) => ({
        ...prev,
        service: prev.service || tech.service || tech.service_name || "",
        technician_name: prev.technician_name || tech.name || "",
        price_per_hour: prev.price_per_hour || tech.price_per_hour || 0,
      }));
    } catch {
      setMessage({ type: "error", text: t("request.errors.loadTechnician") });
    }
  };

  useEffect(() => {
    loadUser();
    loadTechnician();
  }, [selectedTechnicianId]);

  const loadTimesForDate = async (date) => {
    try {
      setMessage(null);
      setAvailableTimes([]);
      setTimesLoading(true);

      if (!selectedTechnicianId || !date) return;

      const res = await API.get(`/technicians/${selectedTechnicianId}/availability`, {
        params: { date },
      });

      const list = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.availability)
        ? res.data.availability
        : [];

      const times = list
        .filter((x) => !isBooked(x))
        .filter((x) => !x.available_date || normalizeDate(x.available_date) === date)
        .map((x) => {
          const start = normalizeTime(x.start_time);
          const end = normalizeTime(x.end_time);

          return {
            id: x.id || `${date}-${start}`,
            value: start,
            label: end ? `${shortTime(start)} - ${shortTime(end)}` : shortTime(start),
          };
        })
        .filter((x) => x.value);

      const unique = [];
      const seen = new Set();

      times.forEach((t) => {
        if (!seen.has(t.value)) {
          seen.add(t.value);
          unique.push(t);
        }
      });

      setAvailableTimes(unique);
      setForm((prev) => ({
        ...prev,
        scheduled_time: unique[0]?.value || "",
      }));

      if (!unique.length) {
        setMessage({
          type: "error",
          text: t("request.errors.noTimesForDate"),
        });
      }
    } catch (err) {
      setAvailableTimes([]);
      setForm((prev) => ({ ...prev, scheduled_time: "" }));
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          t("request.errors.loadTimes"),
      });
    } finally {
      setTimesLoading(false);
    }
  };

  const timeOptions = useMemo(() => {
    if (!form.scheduled_date) return [{ label: t("request.chooseDateFirst"), value: "" }];
    if (timesLoading) return [{ label: t("request.loadingTimes"), value: "" }];
    if (!availableTimes.length) return [{ label: t("request.noTimes"), value: "" }];
    return availableTimes;
  }, [form.scheduled_date, timesLoading, availableTimes]);

  const updateField = (key, value) => {
    setMessage(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const getCurrentUserLocation = async () => {
    try {
      setLocationLoading(true);
      setMessage(null);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setMessage({
          type: "error",
          text: t("request.errors.locationPermission"),
        });
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setUserLocation({
        lat,
        lng,
        url: `https://www.google.com/maps?q=${lat},${lng}`,
      });

      setMessage({ type: "success", text: t("request.locationAdded") });
    } catch {
      setMessage({ type: "error", text: t("request.errors.locationFailed") });
    } finally {
      setLocationLoading(false);
    }
  };

  const validate = () => {
    if (!selectedTechnicianId) return t("request.errors.chooseTechnician");
    if (!form.scheduled_date) return t("request.errors.chooseDate");
    if (!form.scheduled_time) return t("request.errors.chooseTime");
    if (!form.description.trim() || form.description.trim().length < 3) {
      return t("request.errors.descriptionMin");
    }
    if (Number(form.estimated_hours || 0) < 1) {
      return t("request.errors.hoursMin");
    }

    const selectedTimeExists = availableTimes.some(
      (t) => normalizeTime(t.value) === normalizeTime(form.scheduled_time)
    );

    if (!selectedTimeExists) return t("request.errors.chooseAvailableTime");

    return "";
  };

  const buildPayload = () => ({
    user_id: user.id,
    technician_id: Number(selectedTechnicianId),
    service: form.service,
    service_type: form.service,
    description: form.description.trim(),
    city: user.city || "",
    location: form.location_note.trim(),
    location_note: form.location_note.trim(),
    scheduled_date: form.scheduled_date,
    scheduled_time: normalizeTime(form.scheduled_time),
    estimated_hours: Number(form.estimated_hours || 1),
    payment_method: form.payment_method,
    price_per_hour: Number(form.price_per_hour || 0),
    total_price: totalPrice,
    amount: totalPrice,
    user_location_lat: userLocation?.lat || null,
    user_location_lng: userLocation?.lng || null,
    user_location_url: userLocation?.url || null,
  });

  const submitRequest = async () => {
    const validationError = validate();

    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    const payload = buildPayload();

    if (form.payment_method === "online") {
      navigation.navigate("PaymentForm", {
        requestDraft: payload,
        amount: totalPrice,
      });
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      await API.post("/maintenance", payload);

      Alert.alert(t("common.success"), t("request.submitSuccess"));
      navigation.navigate("MaintenanceHistory");
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          t("request.errors.submitFailed"),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title={t("request.headerTitle")} />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        keyboardShouldPersistTaps="handled"
      >
        <HeroSection
          title={t("request.title")}
          subtitle={t("request.subtitle")}
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

        <View style={appStyles.card}>
          <Text style={appStyles.label}>{t("request.service")}</Text>
          <TextInput style={appStyles.input} value={form.service} editable={false} />

          <Text style={appStyles.label}>{t("request.technician")}</Text>
          <TextInput
            style={appStyles.input}
            value={form.technician_name}
            editable={false}
          />

          <CustomDropdown
            label={t("request.date")}
            value={form.scheduled_date}
            options={dateOptions}
            placeholder={t("request.chooseDatePlaceholder")}
            onChange={(value) => {
              updateField("scheduled_date", value);
              updateField("scheduled_time", "");
              loadTimesForDate(value);
            }}
          />

          <CustomDropdown
            label={t("request.timeSlot")}
            value={form.scheduled_time}
            options={timeOptions}
            placeholder={t("request.chooseTimePlaceholder")}
            onChange={(value) => updateField("scheduled_time", value)}
          />

          <Text style={appStyles.label}>{t("request.estimatedHours")}</Text>
          <TextInput
            style={appStyles.input}
            value={form.estimated_hours}
            keyboardType="numeric"
            onChangeText={(value) =>
              updateField("estimated_hours", value.replace(/[^\d]/g, ""))
            }
          />

          <Text style={appStyles.label}>{t("request.paymentMethod")}</Text>
          <View style={appStyles.row}>
            {[
              { label: t("request.cash"), value: "cash" },
              { label: t("request.online"), value: "online" },
            ].map((item) => {
              const active = form.payment_method === item.value;

              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    appStyles.secondaryBtn,
                    {
                      flex: 1,
                      backgroundColor: active ? c.primary : c.card,
                    },
                  ]}
                  onPress={() => updateField("payment_method", item.value)}
                >
                  <Text
                    style={[
                      appStyles.secondaryBtnText,
                      { color: active ? "#fff" : c.primary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={appStyles.warningBox}>
            <Text style={appStyles.text}>
              {Number(form.price_per_hour || 0).toFixed(2)} JOD/{t("request.hour")} ×{" "}
              {form.estimated_hours || 1} = {totalPrice.toFixed(2)} JOD
            </Text>
          </View>

          <Text style={appStyles.label}>{t("request.locationNote")}</Text>
          <TextInput
            style={appStyles.input}
            value={form.location_note}
            onChangeText={(value) => updateField("location_note", value)}
            placeholder={t("request.locationPlaceholder")}
          />

          <TouchableOpacity
            style={appStyles.secondaryBtn}
            onPress={getCurrentUserLocation}
            disabled={locationLoading}
          >
            <Text style={appStyles.secondaryBtnText}>
              {locationLoading ? t("request.gettingLocation") : t("request.useMyLocation")}
            </Text>
          </TouchableOpacity>

          {userLocation ? (
            <View style={{ marginTop: 14 }}>
              <MapView
                style={{
                  width: "100%",
                  height: 220,
                  borderRadius: 22,
                }}
                initialRegion={{
                  latitude: userLocation.lat,
                  longitude: userLocation.lng,
                  latitudeDelta: 0.01,
                  longitudeDelta: 0.01,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: userLocation.lat,
                    longitude: userLocation.lng,
                  }}
                  title={t("request.yourLocation")}
                />
              </MapView>

              <TouchableOpacity
                style={appStyles.secondaryBtn}
                onPress={() => Linking.openURL(userLocation.url)}
              >
                <Text style={appStyles.secondaryBtnText}>{t("request.openLocation")}</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={appStyles.label}>{t("request.description")}</Text>
          <TextInput
            style={[appStyles.input, appStyles.textArea]}
            value={form.description}
            multiline
            onChangeText={(value) => updateField("description", value)}
            placeholder={t("request.descriptionPlaceholder")}
          />

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={submitRequest}
            disabled={submitting}
          >
            <Text style={appStyles.primaryBtnText}>
              {submitting
                ? t("request.submitting")
                : form.payment_method === "online"
                ? t("request.continueToPayment")
                : t("request.submitRequest")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default MaintenanceRequest;
