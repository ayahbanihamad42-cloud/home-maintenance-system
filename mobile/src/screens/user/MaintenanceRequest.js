import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Linking,StyleSheet
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import * as Location from "expo-location";

import Header from "../../components/Common/Header";
import {
  getTechnicians,
  getAvailability,
  getTechnicianProfile,
} from "../../services/technicianService";
import { createMaintenanceRequest } from "../../services/maintenanceService";
import { createMockPayment } from "../../services/paymentservice";
import appStyles from "../../styles/mobileStyles";

function MaintenanceRequest() {
  const route = useRoute();
  const navigation = useNavigation();
  const initialTechnicianId = route.params?.technicianId;

  const [service, setService] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState(initialTechnicianId || "");
  const [technicianName, setTechnicianName] = useState("");
  const [technicianPrice, setTechnicianPrice] = useState(0);

  const [date, setDate] = useState("");
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [locationNote, setLocationNote] = useState("");

  const [estimatedHours, setEstimatedHours] = useState("1");
  const [paymentMethod, setPaymentMethod] = useState("cash");

  const [geoCoords, setGeoCoords] = useState(null);
  const [geoError, setGeoError] = useState("");
  const [requestMessage, setRequestMessage] = useState(null);

  const showMessage = (type, title, body) => {
    setRequestMessage({ type, title, body });
    setTimeout(() => setRequestMessage(null), 2800);
  };

  const formatDate = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const totalPrice = useMemo(() => {
    return Number(technicianPrice || 0) * Number(estimatedHours || 1);
  }, [technicianPrice, estimatedHours]);

  const openMap = async () => {
    const query = locationNote || "Jordan";
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
    await Linking.openURL(url);
  };

  // Fetch technicians
  useEffect(() => {
    if (!service || initialTechnicianId) return;

    getTechnicians(service)
      .then((data) => setTechnicians(data || []))
      .catch(() => setTechnicians([]));
  }, [service]);

  // Fetch technician profile
  useEffect(() => {
    if (!technicianId) return;

    getTechnicianProfile(technicianId)
      .then((res) => {
        setService(res?.service || "");
        setTechnicianName(res?.name || "");
        setTechnicianPrice(Number(res?.price_per_hour || 0));
      })
      .catch(() => {});
  }, [technicianId]);

  // Fetch availability
  useEffect(() => {
    if (!date || !technicianId) return;

    getAvailability(technicianId, date)
      .then((data) => {
        setSlots(data || []);
        setTime("");

        if (!data.length) {
          showMessage("warning", "Notice", "No availability for this date");
        }
      })
      .catch(() => {
        showMessage("error", "Notice", "Failed to load availability");
      });
  }, [date, technicianId]);

  // Get location
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setGeoError("Location permission denied");
        return;
      }

      const loc = await Location.getCurrentPositionAsync({});
      setGeoCoords({
        lat: loc.coords.latitude,
        lng: loc.coords.longitude,
      });
    })();
  }, []);

  // Submit
  const submit = async () => {
    if (!service || !technicianId || !date || !time || !description?.trim()) {
      showMessage("warning", "Notice", "Fill all required fields");
      return;
    }

    const payload = {
      technician_id: technicianId,
      description,
      scheduled_date: date,
      scheduled_time: time,
      service,
      location_note: locationNote,
      estimated_hours: Number(estimatedHours),
      payment_method: paymentMethod,
    };

    try {
      if (paymentMethod === "online") {
        const payment = await createMockPayment({
          amount: totalPrice,
          technicianId,
          hoursRequested: Number(estimatedHours),
        });

        const res = await createMaintenanceRequest({
          ...payload,
          payment_transaction_id: payment.transactionId,
        });

        navigation.navigate("PaymentSuccess", {
          requestId: res.id,
          transactionId: payment.transactionId,
          totalPrice,
        });

        return;
      }

      const res = await createMaintenanceRequest(payload);

      navigation.navigate("Review", { requestId: res.id });

    } catch (e) {
      showMessage("error", "Notice", "Server error");
    }
  };

  return (
    <SafeAreaView style={appStyles.screen}>
      <Header />

      <ScrollView contentContainerStyle={appStyles.content}>
        <Text style={appStyles.title}>Maintenance Request</Text>

        {requestMessage && (
          <View style={[appStyles.messageCard]}>
            <Text>{requestMessage.body}</Text>
          </View>
        )}

        {/* DATE PICKER */}
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
            minimumDate={new Date()}
            onChange={(e, selected) => {
              setShowDatePicker(false);
              if (selected) setDate(formatDate(selected));
            }}
          />
        )}

        {/* TIME */}
        <Text style={appStyles.label}>Time</Text>
        <Picker selectedValue={time} onValueChange={setTime}>
          <Picker.Item label="Select time" value="" />
          {slots.map((s) => (
            <Picker.Item key={s.id} label={s.start_time} value={s.start_time} />
          ))}
        </Picker>

        {/* DESCRIPTION */}
        <TextInput
          style={appStyles.input}
          placeholder="Describe the issue"
          value={description}
          onChangeText={setDescription}
        />

        {/* MAP */}
        <TouchableOpacity style={appStyles.primaryBtn} onPress={openMap}>
          <Text style={appStyles.primaryBtnText}>Open Map</Text>
        </TouchableOpacity>

        {/* SUBMIT */}
        <TouchableOpacity style={appStyles.primaryBtn} onPress={submit}>
          <Text style={appStyles.primaryBtnText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

export default MaintenanceRequest;