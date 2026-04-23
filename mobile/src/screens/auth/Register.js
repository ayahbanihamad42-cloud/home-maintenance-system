import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { register } from "../../services/auth.service.js";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  Platform,
} from "react-native";

function Register() {
  const navigation = useNavigation();

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    city: "",
    password: "",
  });

  const [showDobPicker, setShowDobPicker] = useState(false);

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const handleDobChange = (event, selectedDate) => {
    if (Platform.OS !== "ios") {
      setShowDobPicker(false);
    }

    if (selectedDate) {
      setForm((prev) => ({
        ...prev,
        dob: formatDate(selectedDate),
      }));
    }
  };

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      await register(form);
      Alert.alert("Success", "Registration completed successfully.");
      navigation.replace("Login");
    } catch (err) {
      const msg = err?.response?.data?.message || "Registration failed.";
      Alert.alert("Error", msg);
      console.error("Register error:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Name</Text>
        <TextInput
          style={styles.input}
          value={form.name}
          onChangeText={(text) => handleChange("name", text)}
          placeholder="Enter your name"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={styles.input}
          value={form.email}
          onChangeText={(text) => handleChange("email", text)}
          placeholder="Enter your email"
          autoCapitalize="none"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Phone</Text>
        <TextInput
          style={styles.input}
          value={form.phone}
          onChangeText={(text) => handleChange("phone", text)}
          placeholder="Enter your phone"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Date of Birth</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDobPicker(true)}
        >
          <Text style={form.dob ? styles.valueText : styles.placeholderText}>
            {form.dob || "Select date of birth"}
          </Text>
        </TouchableOpacity>

        {showDobPicker && (
          <DateTimePicker
            value={form.dob ? new Date(form.dob) : new Date(2000, 0, 1)}
            mode="date"
            display="default"
            maximumDate={new Date()}
            onChange={handleDobChange}
          />
        )}
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>City</Text>
        <TextInput
          style={styles.input}
          value={form.city}
          onChangeText={(text) => handleChange("city", text)}
          placeholder="Enter your city"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.label}>Password</Text>
        <TextInput
          style={styles.input}
          value={form.password}
          onChangeText={(text) => handleChange("password", text)}
          placeholder="Enter your password"
          secureTextEntry
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#E8DCCF",
    flexGrow: 1,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
    color: "#111",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    marginBottom: 6,
    color: "#111",
    fontWeight: "600",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 10,
    backgroundColor: "#fff",
    minHeight: 44,
    justifyContent: "center",
  },
  valueText: {
    color: "#111",
  },
  placeholderText: {
    color: "#888",
  },
  button: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
  link: {
    color: "#2563eb",
    textAlign: "center",
    marginTop: 15,
  },
});

export default Register;