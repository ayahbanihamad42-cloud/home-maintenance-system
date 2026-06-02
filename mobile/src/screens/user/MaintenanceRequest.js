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

  const selectedTechnicianId =
    params.technicianId ||
    params.technician_id ||
    params.id ||
    params.technician?.id ||
    params.technician?.technicianId ||
    "";

  const [user, setUser] = useState({});
  const [technician, setTechnician] = useState(params.technician || null);

  const [availability, setAvailability] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);

  const [form, setForm] = useState({
    service: params.service || params.service_type || "",
    technicianName: params.technicianName || params.name || "",
    date: "",
    time: "",
    estimatedHours: "1",
    paymentMethod: "cash",
    locationNote: "",
    description: "",
  });

  const [userLocation, setUserLocation] = useState(null);
  const [message, setMessage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const pricePerHour = Number(
    technician?.price_per_hour ||
      params.price_per_hour ||
      params.price ||
      0
  );

  const totalPrice =
    Number(pricePerHour || 0) * Math.max(Number(form.estimatedHours || 1), 1);

  const paymentOptions = [
    { label: "Cash", value: "cash" },
    { label: "Online", value: "online" },
  ];

  const normalizeDate = (value) => {
    if (!value) return "";
    const raw = String(value);
    const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : raw.slice(0, 10);
  };

  const normalizeTime = (value) => {
    if (!value) return "";
    return String(value).slice(0, 8);
  };

  const loadUser = async () => {
    const raw = await AsyncStorage.getItem("user");
    setUser(raw ? JSON.parse(raw) : {});
  };

  const loadTechnician = async () => {
    if (!selectedTechnicianId) return;

    try {
      const res = await API.get(`/technicians/${selectedTechnicianId}`);
      const data = res.data || null;

      setTechnician(data);

      setForm((prev) => ({
        ...prev,
        service: prev.service || data?.service || "",
        technicianName: prev.technicianName || data?.name || "",
      }));
    } catch {
      setTechnician(params.technician || null);
    }
  };

  const extractAvailabilityList = (data) => {
    if (Array.isArray(data)) return data;

    if (Array.isArray(data?.availability)) return data.availability;
    if (Array.isArray(data?.oneTime)) return data.oneTime;
    if (Array.isArray(data?.dates)) return data.dates;
    if (Array.isArray(data?.available)) return data.available;

    return [];
  };

  const loadAvailability = async () => {
    if (!selectedTechnicianId) return;

    try {
      setLoadingAvailability(true);
      setMessage(null);

      let res;

      try {
        res = await API.get(`/technicians/${selectedTechnicianId}/availability`);
      } catch {
        try {
          res = await API.get(`/technicians/availability/${selectedTechnicianId}`);
        } catch {
          res = await API.get(`/technicians/${selectedTechnicianId}/available-times`);
        }
      }

      const list = extractAvailabilityList(res.data).filter((item) => {
        const booked = Number(item.is_booked || 0) === 1;
        return !booked;
      });

      setAvailability(list);

      const firstDate = list[0] ? normalizeDate(list[0].available_date || list[0].date) : "";
      const firstTime = list[0] ? normalizeTime(list[0].start_time || list[0].time) : "";

      setForm((prev) => ({
        ...prev,
        date: prev.date || firstDate,
        time: prev.time || firstTime,
      }));
    } catch {
      setAvailability([]);
      setMessage({
        type: "error",
        text: "Failed to load available dates and times.",
      });
    } finally {
      setLoadingAvailability(false);
    }
  };

  useEffect(() => {
    loadUser();
    loadTechnician();
    loadAvailability();
  }, [selectedTechnicianId]);

  const dateOptions = useMemo(() => {
    const unique = new Set();

    availability.forEach((item) => {
      const date = normalizeDate(item.available_date || item.date);
      if (date) unique.add(date);
    });

    const arr = Array.from(unique);

    return arr.length
      ? arr.map((date) => ({ label: date, value: date }))
      : [{ label: loadingAvailability ? "Loading available dates..." : "No available dates", value: "" }];
  }, [availability, loadingAvailability]);

  const timeOptions = useMemo(() => {
    const times = availability
      .filter((item) => normalizeDate(item.available_date || item.date) === form.date)
      .map((item) => {
        const start = normalizeTime(item.start_time || item.time);
        const end = normalizeTime(item.end_time || "");
        return {
          label: end ? `${start} - ${end}` : start,
          value: start,
        };
      })
      .filter((item) => item.value);

    return times.length
      ? times
      : [{ label: loadingAvailability ? "Loading available times..." : "No available times", value: "" }];
  }, [availability, form.date, loadingAvailability]);

  const updateField = (key, value) => {
    setMessage(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const useMyLocation = async () => {
    try {
      setMessage(null);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        setMessage({
          type: "error",
          text: "Please allow location access.",
        });
        return;
      }

      const pos = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const loc = {
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        url: `https://www.google.com/maps?q=${pos.coords.latitude},${pos.coords.longitude}`,
      };

      setUserLocation(loc);

      setMessage({
        type: "success",
        text: "Location added. Tap to open map.",
      });
    } catch {
      setMessage({
        type: "error",
        text: "Failed to get your location.",
      });
    }
  };

  const submitRequest = async () => {
    try {
      setMessage(null);

      if (!selectedTechnicianId) {
        setMessage({ type: "error", text: "Technician is missing." });
        return;
      }

      if (!form.service) {
        setMessage({ type: "error", text: "Service is missing." });
        return;
      }

      if (!form.date) {
        setMessage({ type: "error", text: "Please choose an available date." });
        return;
      }

      if (!form.time) {
        setMessage({ type: "error", text: "Please choose an available time." });
        return;
      }

      if (!form.description.trim()) {
        setMessage({ type: "error", text: "Please describe the problem." });
        return;
      }

      setSubmitting(true);

      const payload = {
        user_id: user.id,
        technician_id: Number(selectedTechnicianId),
        service: form.service,
        description: form.description.trim(),
        city: user.city || technician?.city || "",
        scheduled_date: form.date,
        scheduled_time: form.time,
        estimated_hours: Number(form.estimatedHours || 1),
        payment_method: form.paymentMethod,
        total_price: Number(totalPrice.toFixed(2)),
        amount: Number(totalPrice.toFixed(2)),
        location_note: form.locationNote.trim(),
      };

      if (userLocation) {
        payload.user_location_lat = userLocation.lat;
        payload.user_location_lng = userLocation.lng;
        payload.location_url = userLocation.url;
      }

      const res = await API.post("/maintenance", payload);

      const createdRequest = res.data || {};
      const requestId = createdRequest.id || createdRequest.request_id;

      if (form.paymentMethod === "online") {
        navigation.navigate("PaymentForm", {
          requestId,
          amount: Number(totalPrice.toFixed(2)),
          total: Number(totalPrice.toFixed(2)),
        });
      } else {
        Alert.alert("Success", "Request submitted successfully.");
        navigation.navigate("MaintenanceHistory");
      }
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to submit request.",
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
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <HeroSection
          title="Maintenance Request"
          subtitle="Choose an available time, share your location, and submit your request."
        />

        {message ? (
          <TouchableOpacity
            activeOpacity={message.type === "success" && userLocation ? 0.8 : 1}
            onPress={() => {
              if (message.type === "success" && userLocation) {
                Linking.openURL(userLocation.url);
              }
            }}
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
          </TouchableOpacity>
        ) : null}

        <View style={appStyles.card}>
          <Text style={appStyles.label}>Service</Text>
          <TextInput
            style={appStyles.input}
            value={form.service}
            editable={false}
            placeholder="Service"
          />

          <Text style={appStyles.label}>Technician</Text>
          <TextInput
            style={appStyles.input}
            value={form.technicianName}
            editable={false}
            placeholder="Technician"
          />

          <CustomDropdown
            label="Date"
            value={form.date}
            options={dateOptions}
            onChange={(value) => {
              updateField("date", value);
              const firstTimeForDate = availability.find(
                (item) =>
                  normalizeDate(item.available_date || item.date) === value
              );
              updateField(
                "time",
                firstTimeForDate
                  ? normalizeTime(firstTimeForDate.start_time || firstTimeForDate.time)
                  : ""
              );
            }}
          />

          <CustomDropdown
            label="Time Slot"
            value={form.time}
            options={timeOptions}
            onChange={(value) => updateField("time", value)}
          />

          <Text style={appStyles.label}>Estimated Hours</Text>
          <TextInput
            style={appStyles.input}
            value={form.estimatedHours}
            onChangeText={(value) =>
              updateField("estimatedHours", value.replace(/[^\d]/g, ""))
            }
            keyboardType="numeric"
            placeholder="1"
          />

          <Text style={appStyles.label}>Payment Method</Text>
          <View style={appStyles.row}>
            {paymentOptions.map((item) => {
              const active = form.paymentMethod === item.value;

              return (
                <TouchableOpacity
                  key={item.value}
                  style={[
                    appStyles.secondaryBtn,
                    {
                      flex: 1,
                      backgroundColor: active ? colors.primary : "#FFFFFF",
                    },
                  ]}
                  onPress={() => updateField("paymentMethod", item.value)}
                >
                  <Text
                    style={[
                      appStyles.secondaryBtnText,
                      { color: active ? "#FFFFFF" : colors.primaryDark },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={appStyles.label}>Price Summary</Text>
          <View style={appStyles.infoBox}>
            <Text style={appStyles.text}>
              {pricePerHour.toFixed(2)} JOD/hour | Hours:{" "}
              {Number(form.estimatedHours || 1)} | Total:{" "}
              {totalPrice.toFixed(2)} JOD
            </Text>
          </View>

          <Text style={appStyles.label}>Location Note</Text>
          <TextInput
            style={appStyles.input}
            value={form.locationNote}
            onChangeText={(value) => updateField("locationNote", value)}
            placeholder="Example: Irbid, near Yarmouk University"
          />

          <TouchableOpacity style={appStyles.secondaryBtn} onPress={useMyLocation}>
            <Text style={appStyles.secondaryBtnText}>Use My Location</Text>
          </TouchableOpacity>

          {userLocation && (
            <View style={[appStyles.card, { marginTop: 14 }]}>
              <Text style={appStyles.sectionTitle}>Your Location</Text>

              <MapView
                style={{
                  width: "100%",
                  height: 230,
                  borderRadius: 22,
                  overflow: "hidden",
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
                <Text style={appStyles.secondaryBtnText}>Open My Location</Text>
              </TouchableOpacity>
            </View>
          )}

          <Text style={appStyles.label}>Description</Text>
          <TextInput
            style={[appStyles.input, appStyles.textArea]}
            value={form.description}
            onChangeText={(value) => updateField("description", value)}
            placeholder="Describe the problem..."
            multiline
          />

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={submitRequest}
            disabled={submitting}
          >
            <Text style={appStyles.primaryBtnText}>
              {submitting
                ? "Submitting..."
                : form.paymentMethod === "online"
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