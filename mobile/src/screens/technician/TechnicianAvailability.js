import { useEffect, useState } from "react";
// React hooks

import API from "../../services/api";
// Axios API instance

import Header from "../../components/common/Header";
// Header component

import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView
} from "react-native";

// Technician availability management component
function TechnicianAvailability() {

  // Get logged-in user from AsyncStorage
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      const raw = await AsyncStorage.getItem("user");
      if (raw) setUser(JSON.parse(raw));
    };
    loadUser();
  }, []);

  // Store technician ID
  const [technicianId, setTechnicianId] = useState(null);

  // Track technician profile status
  const [technicianStatus, setTechnicianStatus] = useState("loading");

  // Feedback message state
  const [message, setMessage] = useState("");

  // Availability form state
  const [form, setForm] = useState({
    day: "",
    start_time: "",
    end_time: ""
  });

  // Fetch technician profile using user ID
  useEffect(() => {

    // Stop if user is not available
    if (!user?.id) return;

    // Set loading state
    setTechnicianStatus("loading");

    // Request technician data
    API.get(`/technicians/user/${user.id}`)
      .then((res) => {

        // Save technician ID
        setTechnicianId(res.data.technicianId);

        // Mark profile as ready
        setTechnicianStatus("ready");

        // Clear messages
        setMessage("");
      })
      .catch(() => {

        // Handle missing technician profile
        setTechnicianId(null);
        setTechnicianStatus("error");
      });

  }, [user?.id]);

  // Submit availability data
  const submit = async () => {

    // Validate form inputs
    if (!form.day || !form.start_time || !form.end_time) {
      setMessage("Please choose a date and time range.");
      return;
    }

    // Handle missing technician profile
    if (!technicianId && technicianStatus === "error") {
      setMessage("Technician profile not found. Please contact the admin.");
      return;
    }

    try {
      // Send availability data to backend
      await API.post("/technicians/availability", {

        // Include technician ID if available
        ...(technicianId ? { technician_id: technicianId } : {}),

        // Include availability form data
        ...form
      });

      // Show success message
      setMessage("Availability saved");

    } catch (error) {

      // Handle API error
      setMessage(
        error.response?.data?.message ||
        "Failed to save availability."
      );
    }
  };

  return (
    <>
      {/* Page header */}
      <Header />

      <ScrollView style={styles.container}>

        {/* Page title */}
        <Text style={styles.title}>Set Availability</Text>

        <View style={styles.panel}>

          {/* Date input */}
          <View style={styles.inputGroup}>
            <Text>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="YYYY-MM-DD"
              onChangeText={text =>
                setForm({ ...form, day: text })
              }
            />
          </View>

          {/* Start time input */}
          <View style={styles.inputGroup}>
            <Text>Start Time</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              onChangeText={text =>
                setForm({ ...form, start_time: text })
              }
            />
          </View>

          {/* End time input */}
          <View style={styles.inputGroup}>
            <Text>End Time</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              onChangeText={text =>
                setForm({ ...form, end_time: text })
              }
            />
          </View>

          {/* Feedback message */}
          {message ? (
            <Text style={styles.message}>{message}</Text>
          ) : null}

          {/* Submit button */}
          <TouchableOpacity style={styles.button} onPress={submit}>
            <Text style={styles.buttonText}>Save</Text>
          </TouchableOpacity>

        </View>
      </ScrollView>
    </>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 15,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  panel: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 10,
  },
  inputGroup: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 5,
  },
  message: {
    marginBottom: 10,
    color: "#333",
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
});

export default TechnicianAvailability;