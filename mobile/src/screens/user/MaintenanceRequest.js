import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Platform,
  Alert,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";
import { useNavigation, useRoute } from "@react-navigation/native";

import Header from "../../components/Common/Header";
import {
  getAvailability,
  getTechnicianProfile,
} from "../../services/technicianService";
import { createMaintenanceRequest } from "../../services/maintenanceService";
import appStyles from "../../styles/mobileStyles";

function MaintenanceRequest() {
  const navigation = useNavigation();
  const route = useRoute();

  const technicianId = route.params?.technicianId || "";

  const [technicianName, setTechnicianName] = useState("");
  const [service, setService] = useState("");
  const [pricePerHour, setPricePerHour] = useState(0);

  const [date, setDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");

  const [description, setDescription] = useState("");
  const [city, setCity] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [estimatedHours, setEstimatedHours] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [region, setRegion] = useState({
    latitude: 31.9539,
    longitude: 35.9106,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  const [marker, setMarker] = useState({
    latitude: 31.9539,
    longitude: 35.9106,
  });

  const [locationReady, setLocationReady] = useState(false);
  const [loadingLocation, setLoadingLocation] = useState(true);

  const totalPrice = useMemo(() => {
    return Number(pricePerHour || 0) * Number(estimatedHours || 1);
  }, [pricePerHour, estimatedHours]);

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  useEffect(() => {
    if (!technicianId) return;

    getTechnicianProfile(technicianId)
      .then((res) => {
        setTechnicianName(res?.name || "");
        setService(res?.service || "");
        setPricePerHour(Number(res?.price_per_hour || 0));
      })
      .catch((err) => {
        console.error("Technician profile error:", err);
      });
  }, [technicianId]);

  useEffect(() => {
    if (!technicianId || !date) return;

    getAvailability(technicianId, date)
      .then((data) => {
        setSlots(data || []);
        setTime("");
      })
      .catch((err) => {
        console.error("Availability error:", err);
        setSlots([]);
      });
  }, [technicianId, date]);

  useEffect(() => {
    (async () => {
      try {
        setLoadingLocation(true);

        const { status } = await Location.requestForegroundPermissionsAsync();

        if (status !== "granted") {
          setLoadingLocation(false);
          return;
        }

        const current = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        };

        setRegion(newRegion);
        setMarker({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });
        setLocationReady(true);

        const reverse = await Location.reverseGeocodeAsync({
          latitude: current.coords.latitude,
          longitude: current.coords.longitude,
        });

        if (reverse?.length) {
          const place = reverse[0];
          setCity(place.city || place.subregion || place.region || "");
          setLocationNote(
            [
              place.name,
              place.street,
              place.district,
              place.city,
              place.region,
            ]
              .filter(Boolean)
              .join(", ")
          );
        }
      } catch (err) {
        console.error("Location error:", err);
      } finally {
        setLoadingLocation(false);
      }
    })();
  }, []);

  const handleDateChange = (event, selectedDate) => {
    if (Platform.OS !== "ios") {
      setShowDatePicker(false);
    }

    if (selectedDate) {
      setDate(formatDate(selectedDate));
    }
  };

  const onMarkerDragEnd = async (e) => {
    const coords = e.nativeEvent.coordinate;

    setMarker(coords);
    setRegion((prev) => ({
      ...prev,
      latitude: coords.latitude,
      longitude: coords.longitude,
    }));

    try {
      const reverse = await Location.reverseGeocodeAsync(coords);

      if (reverse?.length) {
        const place = reverse[0];
        setCity(place.city || place.subregion || place.region || "");
        setLocationNote(
          [
            place.name,
            place.street,
            place.district,
            place.city,
            place.region,
          ]
            .filter(Boolean)
            .join(", ")
        );
      }
    } catch (err) {
      console.error("Reverse geocode error:", err);
    }
  };

  const submit = async () => {
    if (!technicianId) {
      Alert.alert("Error", "Technician not found.");
      return;
    }

    if (!date || !time || !description.trim()) {
      Alert.alert("Notice", "Please fill all required fields.");
      return;
    }

    const payload = {
      technician_id: technicianId,
      description: description.trim(),
      scheduled_date: date,
      scheduled_time: time,
      service,
      city,
      location_note: locationNote,
      estimated_hours: Number(estimatedHours || 1),
      payment_method: paymentMethod,
      latitude: marker.latitude,
      longitude: marker.longitude,
      total_price: totalPrice,
    };

    try {
      console.log("Maintenance request payload:", payload);

      const res = await createMaintenanceRequest(payload);

      navigation.navigate("Review", {
        requestId: res?.id,
      });
    } catch (err) {
      console.error("Maintenance request error:", err?.response?.data || err);
      Alert.alert(
        "Server Error",
        err?.response?.data?.message ||
          err?.message ||
          "Something went wrong while creating the request."
      );
    }
  };

  return (
    <SafeAreaView style={appStyles.screen}>
      <Header />

      <ScrollView contentContainerStyle={appStyles.content}>
        <Text style={appStyles.title}>Maintenance Request</Text>

        <View style={appStyles.card}>
          <Text style={appStyles.label}>Technician</Text>
          <Text style={appStyles.infoRow}>{technicianName || "Loading..."}</Text>

          <Text style={appStyles.label}>Service</Text>
          <Text style={appStyles.infoRow}>{service || "-"}</Text>

          <Text style={appStyles.label}>Price / Hour</Text>
          <Text style={appStyles.infoRow}>{pricePerHour} JOD</Text>
        </View>

        <Text style={appStyles.label}>Date</Text>
        <TouchableOpacity
          style={appStyles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text>{date || "Select date"}</Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date ? new Date(date) : new Date()}
            mode="date"
            display="default"
            minimumDate={new Date()}
            onChange={handleDateChange}
          />
        )}

        <Text style={appStyles.label}>Time</Text>
        <Picker selectedValue={time} onValueChange={setTime}>
          <Picker.Item label="Select time" value="" />
          {slots.map((slot) => (
            <Picker.Item
              key={slot.id}
              label={slot.start_time}
              value={slot.start_time}
            />
          ))}
        </Picker>

        <Text style={appStyles.label}>Description</Text>
        <TextInput
          style={[appStyles.input, { minHeight: 100, textAlignVertical: "top" }]}
          placeholder="Describe the issue"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        <Text style={appStyles.label}>City</Text>
        <TextInput
          style={appStyles.input}
          placeholder="City"
          value={city}
          onChangeText={setCity}
        />

        <Text style={appStyles.label}>Location Note</Text>
        <TextInput
          style={[appStyles.input, { minHeight: 80, textAlignVertical: "top" }]}
          placeholder="Building, street, apartment..."
          value={locationNote}
          onChangeText={setLocationNote}
          multiline
        />

        <Text style={appStyles.label}>Estimated Hours</Text>
        <TextInput
          style={appStyles.input}
          placeholder="Estimated hours"
          value={estimatedHours}
          onChangeText={setEstimatedHours}
          keyboardType="numeric"
        />

        <Text style={appStyles.label}>Payment Method</Text>
        <Picker selectedValue={paymentMethod} onValueChange={setPaymentMethod}>
          <Picker.Item label="Cash" value="cash" />
          <Picker.Item label="Online" value="online" />
        </Picker>

        <Text style={appStyles.label}>Location on Map</Text>
        <View
          style={{
            height: 260,
            borderRadius: 16,
            overflow: "hidden",
            marginBottom: 16,
            borderWidth: 1,
            borderColor: "#d6c7b8",
          }}
        >
          <MapView
            style={{ flex: 1 }}
            region={region}
            onRegionChangeComplete={setRegion}
          >
            <Marker
              coordinate={marker}
              draggable
              onDragEnd={onMarkerDragEnd}
              title="Your location"
              description="Drag to adjust"
            />
          </MapView>
        </View>

        <View style={appStyles.card}>
          <Text style={appStyles.infoRow}>
            Latitude: {marker.latitude.toFixed(6)}
          </Text>
          <Text style={appStyles.infoRow}>
            Longitude: {marker.longitude.toFixed(6)}
          </Text>
          <Text style={appStyles.infoRow}>
            {loadingLocation
              ? "Getting current location..."
              : locationReady
              ? "Location loaded successfully"
              : "Location permission not granted"}
          </Text>
          <Text style={appStyles.infoRow}>Total Price: {totalPrice} JOD</Text>
        </View>

        <TouchableOpacity style={appStyles.primaryBtn} onPress={submit}>
          <Text style={appStyles.primaryBtnText}>Submit Request</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default MaintenanceRequest;