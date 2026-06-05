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

import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import CustomDropdown from "../../components/Common/CustomDropdown";
import API from "../../services/api";
import appStyles, { colors } from "../../styles/mobileStyles";

function MaintenanceRequest({ route, navigation }) {
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
      setMessage({ type: "error", text: "Failed to load technician data." });
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
          text: "No available times for this date.",
        });
      }
    } catch (err) {
      setAvailableTimes([]);
      setForm((prev) => ({ ...prev, scheduled_time: "" }));
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to load available dates and times.",
      });
    } finally {
      setTimesLoading(false);
    }
  };

  const timeOptions = useMemo(() => {
    if (!form.scheduled_date) return [{ label: "Choose a date first", value: "" }];
    if (timesLoading) return [{ label: "Loading available times...", value: "" }];
    if (!availableTimes.length) return [{ label: "No available times", value: "" }];
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
          text: "Please allow location access.",
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

      setMessage({ type: "success", text: "Your location has been added." });
    } catch {
      setMessage({ type: "error", text: "Failed to get your location." });
    } finally {
      setLocationLoading(false);
    }
  };

  const validate = () => {
    if (!selectedTechnicianId) return "Please choose a technician.";
    if (!form.scheduled_date) return "Please choose a date.";
    if (!form.scheduled_time) return "Please choose a time.";
    if (!form.description.trim() || form.description.trim().length < 3) {
      return "Description must be at least 3 characters.";
    }
    if (Number(form.estimated_hours || 0) < 1) {
      return "Estimated hours must be at least 1.";
    }

    const selectedTimeExists = availableTimes.some(
      (t) => normalizeTime(t.value) === normalizeTime(form.scheduled_time)
    );

    if (!selectedTimeExists) return "Please choose an available time.";

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

      Alert.alert("Success", "Request submitted successfully.");
      navigation.navigate("MaintenanceHistory");
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to submit request. Please choose another time.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Request" />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        keyboardShouldPersistTaps="handled"
      >
        <HeroSection
          title="Maintenance Request"
          subtitle="Choose an available time and submit your request."
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
          <Text style={appStyles.label}>Service</Text>
          <TextInput style={appStyles.input} value={form.service} editable={false} />

          <Text style={appStyles.label}>Technician</Text>
          <TextInput
            style={appStyles.input}
            value={form.technician_name}
            editable={false}
          />

          <CustomDropdown
            label="Date"
            value={form.scheduled_date}
            options={dateOptions}
            placeholder="Choose date"
            onChange={(value) => {
              updateField("scheduled_date", value);
              updateField("scheduled_time", "");
              loadTimesForDate(value);
            }}
          />

          <CustomDropdown
            label="Time Slot"
            value={form.scheduled_time}
            options={timeOptions}
            placeholder="Choose time"
            onChange={(value) => updateField("scheduled_time", value)}
          />

          <Text style={appStyles.label}>Estimated Hours</Text>
          <TextInput
            style={appStyles.input}
            value={form.estimated_hours}
            keyboardType="numeric"
            onChangeText={(value) =>
              updateField("estimated_hours", value.replace(/[^\d]/g, ""))
            }
          />

          <Text style={appStyles.label}>Payment Method</Text>
          <View style={appStyles.row}>
            {[
              { label: "Cash", value: "cash" },
              { label: "Online", value: "online" },
            ].map((item) => {
              const active = form.payment_method === item.value;

              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    appStyles.secondaryBtn,
                    {
                      flex: 1,
                      backgroundColor: active ? colors.primary : "#fff",
                    },
                  ]}
                  onPress={() => updateField("payment_method", item.value)}
                >
                  <Text
                    style={[
                      appStyles.secondaryBtnText,
                      { color: active ? "#fff" : colors.primary },
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
              {Number(form.price_per_hour || 0).toFixed(2)} JOD/hour ×{" "}
              {form.estimated_hours || 1} = {totalPrice.toFixed(2)} JOD
            </Text>
          </View>

          <Text style={appStyles.label}>Location Note</Text>
          <TextInput
            style={appStyles.input}
            value={form.location_note}
            onChangeText={(value) => updateField("location_note", value)}
            placeholder="Write address details..."
          />

          <TouchableOpacity
            style={appStyles.secondaryBtn}
            onPress={getCurrentUserLocation}
            disabled={locationLoading}
          >
            <Text style={appStyles.secondaryBtnText}>
              {locationLoading ? "Getting Location..." : "Use My Location"}
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
                  title="Your Location"
                />
              </MapView>

              <TouchableOpacity
                style={appStyles.secondaryBtn}
                onPress={() => Linking.openURL(userLocation.url)}
              >
                <Text style={appStyles.secondaryBtnText}>Open Location</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <Text style={appStyles.label}>Description</Text>
          <TextInput
            style={[appStyles.input, appStyles.textArea]}
            value={form.description}
            multiline
            onChangeText={(value) => updateField("description", value)}
            placeholder="Describe the problem..."
          />

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={submitRequest}
            disabled={submitting}
          >
            <Text style={appStyles.primaryBtnText}>
              {submitting
                ? "Submitting..."
                : form.payment_method === "online"
                ? "Continue to Payment"
                : "Submit Request"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default MaintenanceRequest;