import React, { useState, useEffect, useMemo } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  SafeAreaView 
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Picker } from "@react-native-picker/picker";
import * as Location from 'expo-location';
import { WebView } from 'react-native-webview';

import Header from "../../components/common/Header";
import { getTechnicians, getAvailability } from "../../services/technicianService";
import { createMaintenanceRequest } from "../../services/maintenanceService";
import API from "../../services/api";

function MaintenanceRequest() {
  const route = useRoute();
  const navigation = useNavigation();
  const initialTechnicianId = route.params?.technicianId;

  const [service, setService] = useState("");
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState(initialTechnicianId || "");
  const [technicianName, setTechnicianName] = useState("");
  const [date, setDate] = useState("");
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState("");
  const [description, setDescription] = useState("");
  const [locationNote, setLocationNote] = useState("");

  const [geoCoords, setGeoCoords] = useState(null);
  const [geoError, setGeoError] = useState("");

  const mapQuery = useMemo(() => {
    if (geoCoords) return `${geoCoords.lat},${geoCoords.lng}`;
    return locationNote ? encodeURIComponent(locationNote) : "Riyadh";
  }, [geoCoords, locationNote]);

  useEffect(() => {
    if (!service) return;
    getTechnicians(service).then((data) => setTechnicians(data || [])).catch(() => setTechnicians([]));
  }, [service]);

  useEffect(() => {
    if (!technicianId) {
      setTechnicianName("");
      return;
    }
    API.get(`/technicians/${technicianId}`)
      .then((res) => {
        setService(res.data?.service || "");
        setTechnicianName(res.data?.name || "");
      })
      .catch(() => setTechnicianName(""));
  }, [technicianId]);

  useEffect(() => {
    if (!date || !technicianId) return;
    getAvailability(technicianId, date)
      .then((data) => setSlots(data || []))
      .catch(() => setSlots([]));
  }, [date, technicianId]);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setGeoError("Permission to access location was denied");
        return;
      }
      let location = await Location.getCurrentPositionAsync({});
      setGeoCoords({ lat: location.coords.latitude, lng: location.coords.longitude });
    })();
  }, []);

  const submit = async () => {
    if (!service || !technicianId || !date || !time) {
      Alert.alert("Error", "Please fill Service, Technician, Date, and Time.");
      return;
    }

    try {
      const response = await createMaintenanceRequest({
        technician_id: technicianId,
        description,
        scheduled_date: date,
        scheduled_time: time,
        service,
        location_note: locationNote,
        city: ""
      });

      if (response?.id) {
        navigation.navigate("Review", { id: response.id });
        return;
      }
      Alert.alert("Notice", "Request submitted, but no id returned.");
    } catch (e) {
      Alert.alert("Error", "Failed to submit request.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>Maintenance Request</Text>

        {technicianId ? (
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Service</Text>
            <View style={styles.readonlyField}><Text>{service || "Loading..."}</Text></View>
            <Text style={styles.label}>Technician</Text>
            <View style={styles.readonlyField}><Text>{technicianName || "Loading..."}</Text></View>
          </View>
        ) : (
          <>
            <Text style={styles.label}>Service Type</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={service} onValueChange={(val) => setService(val)}>
                <Picker.Item label="Select service" value="" />
                <Picker.Item label="Electrical" value="Electrical" />
                <Picker.Item label="Plumbing" value="Plumbing" />
              </Picker>
            </View>

            <Text style={styles.label}>Technician</Text>
            <View style={styles.pickerContainer}>
              <Picker selectedValue={technicianId} onValueChange={(val) => setTechnicianId(val)}>
                <Picker.Item label="Select technician" value="" />
                {technicians.map((tech) => (
                  <Picker.Item key={tech.technicianId} label={`${tech.name} - ${tech.experience} yrs`} value={tech.technicianId} />
                ))}
              </Picker>
            </View>
          </>
        )}

        <Text style={styles.label}>Date (YYYY-MM-DD)</Text>
        <TextInput style={styles.input} value={date} onChangeText={setDate} placeholder="2023-10-25" />

        <Text style={styles.label}>Time Slot</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={time} onValueChange={(val) => setTime(val)}>
            <option value="">Select time</option>
            {slots.map((slot) => (
              <Picker.Item key={slot.id} label={slot.start_time} value={slot.start_time} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Location Note</Text>
        <TextInput style={styles.input} value={locationNote} onChangeText={setLocationNote} placeholder="Address details" />

        <Text style={styles.label}>Description</Text>
        <TextInput style={[styles.input, { height: 80 }]} multiline numberOfLines={3} value={description} onChangeText={setDescription} />

        <Text style={styles.label}>Map Location</Text>
        {geoError ? <Text style={styles.errorText}>{geoError}</Text> : null}
        <View style={styles.mapContainer}>
          <WebView 
            source={{ uri: `https://maps.google.com/maps?q=${mapQuery}&z=14&output=embed` }} 
            style={styles.map}
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={submit}>
          <Text style={styles.buttonText}>Submit</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { padding: 20 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 20 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 5, marginTop: 15 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8, padding: 10, fontSize: 16 },
  readonlyField: { backgroundColor: "#f0f0f0", padding: 12, borderRadius: 8 },
  pickerContainer: { borderWidth: 1, borderColor: "#ccc", borderRadius: 8 },
  mapContainer: { height: 200, marginTop: 10, borderRadius: 8, overflow: 'hidden' },
  map: { flex: 1 },
  button: { backgroundColor: "#007AFF", padding: 15, borderRadius: 8, marginTop: 30, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  errorText: { color: "red", fontSize: 12 }
});

export default MaintenanceRequest;
