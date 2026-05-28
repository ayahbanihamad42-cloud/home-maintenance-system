import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import MapView, { Marker } from "react-native-maps";
import Header from "../../components/Common/Header";
import API from "../../services/api";
import styles from "../../styles/mobileStyles";

export default function MaintenanceRequest({ navigation, route }) {
  const params = route?.params || {};
  const technician = params.tech || params.technician || {};

  const technicianId =
    params.technicianId ||
    params.technician_id ||
    technician.technicianId ||
    technician.technician_id ||
    technician.tech_id ||
    technician.id;

  const [user, setUser] = useState(null);
  const [availableDates, setAvailableDates] = useState([]);
  const [availableTimes, setAvailableTimes] = useState([]);
  const [loadingAvailability, setLoadingAvailability] = useState(false);
  const [message, setMessage] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);

  const [form, setForm] = useState({
    service: params.service || technician.service || "",
    technicianName: params.technicianName || technician.name || "",
    scheduled_date: "",
    scheduled_time: "",
    estimated_hours: "1",
    payment_method: "cash",
    location_note: "",
    description: "",
    price_per_hour: String(
      params.price_per_hour || technician.price_per_hour || 0
    ),
  });

  const totalPrice = useMemo(() => {
    return (
      Number(form.price_per_hour || 0) * Number(form.estimated_hours || 1)
    ).toFixed(2);
  }, [form.price_per_hour, form.estimated_hours]);

  const normalizeDate = (value) => {
    if (!value) return "";

    const raw = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

    const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];

    return raw.slice(0, 10);
  };

  const normalizeTime = (value) => {
    if (!value) return "";
    const raw = String(value).trim();
    const match = raw.match(/^(\d{2}:\d{2})(:\d{2})?/);
    if (match) return match[0].length === 5 ? `${match[0]}:00` : match[0];
    return raw.slice(0, 8);
  };

  const loadUser = async () => {
    const rawUser = await AsyncStorage.getItem("user");
    setUser(rawUser ? JSON.parse(rawUser) : null);
  };

  const loadTechnician = async () => {
    try {
      if (!technicianId) return;

      const res = await API.get(`/technicians/${technicianId}`);
      const tech = res.data || {};

      setForm((prev) => ({
        ...prev,
        service: prev.service || tech.service || "",
        technicianName: prev.technicianName || tech.name || "",
        price_per_hour: String(prev.price_per_hour || tech.price_per_hour || 0),
      }));
    } catch (err) {
      console.log("load technician error:", err?.response?.data || err.message);
    }
  };

  const loadDates = async () => {
    try {
      if (!technicianId) {
        setMessage({
          type: "error",
          title: "Error",
          body: "Technician id is missing.",
        });
        return;
      }

      setLoadingAvailability(true);
      setMessage(null);

      const res = await API.get(`/technicians/${technicianId}/availability`);
      const list = Array.isArray(res.data) ? res.data : [];

      const dates = [
        ...new Set(
          list
            .filter(
              (item) => Number(item.is_booked) !== 1 && item.is_booked !== true
            )
            .map((item) => normalizeDate(item.available_date))
            .filter(Boolean)
        ),
      ].sort();

      setAvailableDates(dates);

      setForm((prev) => ({
        ...prev,
        scheduled_date: dates.length > 0 ? prev.scheduled_date || dates[0] : "",
        scheduled_time: dates.length > 0 ? prev.scheduled_time : "",
      }));
    } catch (err) {
      console.log("load dates error:", err?.response?.data || err.message);
      setAvailableDates([]);
      setAvailableTimes([]);
      setMessage({
        type: "error",
        title: "Error",
        body: "Failed to load available dates and times.",
      });
    } finally {
      setLoadingAvailability(false);
    }
  };

  const loadTimes = async () => {
    try {
      if (!technicianId || !form.scheduled_date) {
        setAvailableTimes([]);
        return;
      }

      const res = await API.get(`/technicians/${technicianId}/availability`, {
        params: { date: form.scheduled_date },
      });

      const list = Array.isArray(res.data) ? res.data : [];

      const times = list
        .filter(
          (item) => Number(item.is_booked) !== 1 && item.is_booked !== true
        )
        .filter((item) => normalizeDate(item.available_date) === form.scheduled_date)
        .map((item) => ({
          id: item.id,
          value: normalizeTime(item.start_time),
          label: `${normalizeTime(item.start_time)} - ${normalizeTime(
            item.end_time
          )}`,
        }));

      setAvailableTimes(times);

      setForm((prev) => ({
        ...prev,
        scheduled_time: times.length > 0 ? times[0].value : "",
      }));
    } catch (err) {
      console.log("load times error:", err?.response?.data || err.message);
      setAvailableTimes([]);
    }
  };

  useEffect(() => {
    loadUser();
    loadTechnician();
    loadDates();
  }, [technicianId]);

  useEffect(() => {
    loadTimes();
  }, [form.scheduled_date]);

  const getCurrentUserLocation = async () => {
    try {
      setLocationLoading(true);

      const permission = await Location.requestForegroundPermissionsAsync();

      if (permission.status !== "granted") {
        throw new Error("Location permission was denied.");
      }

      const servicesEnabled = await Location.hasServicesEnabledAsync();

      if (!servicesEnabled) {
        throw new Error("Please turn on location services from phone settings.");
      }

      let position = await Location.getLastKnownPositionAsync({
        maxAge: 300000,
        requiredAccuracy: 10000,
      });

      if (!position?.coords) {
        position = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
      }

      if (!position?.coords) {
        throw new Error("Current location is unavailable.");
      }

      const lat = position.coords.latitude;
      const lng = position.coords.longitude;

      setUserLocation({
        latitude: lat,
        longitude: lng,
        url: `https://www.google.com/maps?q=${lat},${lng}`,
      });

      setMessage({
        type: "success",
        title: "Location Added",
        body: "Your location has been added to this request.",
      });
    } catch (err) {
      Alert.alert("Location Error", err?.message || "Failed to get location.");
      setMessage({
        type: "error",
        title: "Location Error",
        body: err?.message || "Failed to get location.",
      });
    } finally {
      setLocationLoading(false);
    }
  };

  const checkSlotStillAvailable = async () => {
    const res = await API.get(`/technicians/${technicianId}/availability`, {
      params: { date: form.scheduled_date },
    });

    const list = Array.isArray(res.data) ? res.data : [];

    return list.some(
      (item) =>
        Number(item.is_booked) !== 1 &&
        item.is_booked !== true &&
        normalizeDate(item.available_date) === form.scheduled_date &&
        normalizeTime(item.start_time) === normalizeTime(form.scheduled_time)
    );
  };

  const submit = async () => {
    try {
      setMessage(null);

      if (!user?.id) {
        setMessage({
          type: "error",
          title: "Error",
          body: "User id is missing. Please login again.",
        });
        return;
      }

      if (!technicianId) {
        setMessage({
          type: "error",
          title: "Error",
          body: "Technician id is missing.",
        });
        return;
      }

      if (!form.scheduled_date || !form.scheduled_time) {
        setMessage({
          type: "error",
          title: "Unavailable Time",
          body: "Please choose an available date and time.",
        });
        return;
      }

      const stillAvailable = await checkSlotStillAvailable();

      if (!stillAvailable) {
        setMessage({
          type: "error",
          title: "Unavailable Time",
          body: "This date and time are already booked. Please choose another slot.",
        });

        await loadDates();
        return;
      }

      if (!form.description.trim()) {
        setMessage({
          type: "error",
          title: "Error",
          body: "Please enter description.",
        });
        return;
      }

      const payload = {
        user_id: user.id,
        technician_id: technicianId,
        service: form.service,
        service_type: form.service,
        description: form.description,
        city: user.city || "",
        location: form.location_note,
        location_note: form.location_note,
        scheduled_date: form.scheduled_date,
        scheduled_time: form.scheduled_time,
        estimated_hours: Number(form.estimated_hours || 1),
        payment_method: form.payment_method,
        price_per_hour: Number(form.price_per_hour || 0),
        total_price: Number(totalPrice),
        user_location_lat: userLocation?.latitude || null,
        user_location_lng: userLocation?.longitude || null,
        user_location_url: userLocation?.url || null,
      };

      const res = await API.post("/maintenance", payload);
      const requestId = res.data?.requestId || res.data?.id;

      if (String(form.payment_method).toLowerCase() === "online") {
        navigation.navigate("PaymentForm", {
          requestId,
          amount: Number(totalPrice),
          technicianId,
          estimated_hours: Number(form.estimated_hours || 1),
        });
      } else {
        navigation.navigate("Review", {
          requestId,
          request: {
            ...payload,
            id: requestId,
            status: "pending",
          },
        });
      }
    } catch (err) {
      console.log("submit request error:", err?.response?.data || err.message);

      setMessage({
        type: "error",
        title: "Error",
        body:
          err?.response?.data?.message ||
          "This time slot is no longer available. Please choose another time.",
      });
    }
  };

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.pageContent}>
        <View style={styles.card}>
          <Text style={styles.pageTitle}>Maintenance Request</Text>

          {message ? (
            <View
              style={
                message.type === "error" ? styles.errorBox : styles.successBox
              }
            >
              <Text
                style={
                  message.type === "error"
                    ? styles.errorTitle
                    : styles.successTitle
                }
              >
                {message.title}
              </Text>
              <Text
                style={
                  message.type === "error" ? styles.errorText : styles.successText
                }
              >
                {message.body}
              </Text>
            </View>
          ) : null}

          <Text style={styles.label}>Service</Text>
          <TextInput style={styles.input} value={form.service} editable={false} />

          <Text style={styles.label}>Technician</Text>
          <TextInput
            style={styles.input}
            value={form.technicianName}
            editable={false}
          />

          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <Text style={styles.label}>Date</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={form.scheduled_date}
                  onValueChange={(value) =>
                    setForm({
                      ...form,
                      scheduled_date: value,
                      scheduled_time: "",
                    })
                  }
                >
                  {availableDates.length === 0 ? (
                    <Picker.Item label="No available dates" value="" />
                  ) : (
                    availableDates.map((date) => (
                      <Picker.Item key={date} label={date} value={date} />
                    ))
                  )}
                </Picker>
              </View>
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Time Slot</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={form.scheduled_time}
                  onValueChange={(value) =>
                    setForm({ ...form, scheduled_time: value })
                  }
                >
                  {availableTimes.length === 0 ? (
                    <Picker.Item label="No available times" value="" />
                  ) : (
                    availableTimes.map((time) => (
                      <Picker.Item
                        key={time.id || time.value}
                        label={time.label}
                        value={time.value}
                      />
                    ))
                  )}
                </Picker>
              </View>
            </View>
          </View>

          <View style={styles.twoColumns}>
            <View style={styles.column}>
              <Text style={styles.label}>Estimated Hours</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={form.estimated_hours}
                onChangeText={(value) =>
                  setForm({ ...form, estimated_hours: value })
                }
              />
            </View>

            <View style={styles.column}>
              <Text style={styles.label}>Payment Method</Text>
              <View style={styles.pickerBox}>
                <Picker
                  selectedValue={form.payment_method}
                  onValueChange={(value) =>
                    setForm({ ...form, payment_method: value })
                  }
                >
                  <Picker.Item label="Cash" value="cash" />
                  <Picker.Item label="Online" value="online" />
                </Picker>
              </View>
            </View>
          </View>

          <Text style={styles.label}>Price Summary</Text>
          <TextInput
            style={styles.input}
            editable={false}
            value={`${Number(form.price_per_hour || 0).toFixed(
              2
            )} JOD/hour | Hours: ${form.estimated_hours} | Total: ${totalPrice} JOD`}
          />

          <Text style={styles.label}>Location Note</Text>
          <TextInput
            style={styles.input}
            value={form.location_note}
            onChangeText={(value) => setForm({ ...form, location_note: value })}
            placeholder="Example: Irbid, near Yarmouk University"
          />

          <TouchableOpacity
            style={localStyles.locationBtn}
            onPress={getCurrentUserLocation}
            disabled={locationLoading}
          >
            <Text style={localStyles.locationBtnText}>
              {locationLoading ? "Getting Location..." : "Use My Location"}
            </Text>
          </TouchableOpacity>

          {userLocation ? (
            <View style={localStyles.mapSection}>
              <Text style={localStyles.mapTitle}>Your Request Location</Text>

              <MapView
                style={localStyles.map}
                initialRegion={{
                  latitude: userLocation.latitude,
                  longitude: userLocation.longitude,
                  latitudeDelta: 0.005,
                  longitudeDelta: 0.005,
                }}
              >
                <Marker
                  coordinate={{
                    latitude: userLocation.latitude,
                    longitude: userLocation.longitude,
                  }}
                  title="Your Request Location"
                  description="This location will be shared with the technician."
                />
              </MapView>

              <Text style={localStyles.mapNote}>
                This static location will be shared with the technician.
              </Text>
            </View>
          ) : null}

          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            multiline
            value={form.description}
            onChangeText={(value) => setForm({ ...form, description: value })}
            placeholder="Describe the problem..."
          />

          <TouchableOpacity style={styles.primaryBtn} onPress={submit}>
            <Text style={styles.primaryBtnText}>
              {form.payment_method === "online"
                ? "Continue to Payment"
                : "Submit Request"}
            </Text>
          </TouchableOpacity>

          {loadingAvailability ? (
            <ActivityIndicator color="#111" style={{ marginTop: 18 }} />
          ) : null}
        </View>
      </ScrollView>
    </View>
  );
}

const localStyles = StyleSheet.create({
  locationBtn: {
    backgroundColor: "#111",
    paddingVertical: 13,
    paddingHorizontal: 18,
    borderRadius: 999,
    alignItems: "center",
    marginBottom: 14,
  },
  locationBtnText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 15,
  },
  mapSection: {
    marginBottom: 18,
  },
  mapTitle: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111",
    marginBottom: 10,
  },
  map: {
    width: "100%",
    height: 250,
    borderRadius: 22,
  },
  mapNote: {
    marginTop: 8,
    color: "#6B5E52",
    fontSize: 14,
    fontWeight: "700",
  },
});