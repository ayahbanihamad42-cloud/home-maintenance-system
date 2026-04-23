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
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    city: "",
    password: "",
  });

  const [showDobPicker, setShowDobPicker] = useState(false);
  const navigation = useNavigation();

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
      setForm({ ...form, dob: formatDate(selectedDate) });
    }
  };

  const handleSubmit = async () => {
    try {
      await register(form);
      Alert.alert("Success", "Registration completed successfully.");
      navigation.replace("Login");
    } catch (err) {
      const msg = err.response?.data?.message || "Registration failed.";
      Alert.alert("Error", msg);
      console.error("Register error:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>

      {["name", "email", "phone", "city", "password"].map((f) => (
        <View style={styles.inputGroup} key={f}>
          <Text>{f}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={f === "password"}
            value={form[f]}
            onChangeText={(text) => setForm({ ...form, [f]: text })}
            placeholder={f}
            autoCapitalize={f === "email" ? "none" : "sentences"}
          />
        </View>
      ))}

      <View style={styles.inputGroup}>
        <Text>dob</Text>
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
  },
  inputGroup: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
    justifyContent: "center",
    minHeight: 44,
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Register</Text>

      {["name", "email", "phone", "dob", "city", "password"].map((f) => (
        <View style={styles.inputGroup} key={f}>
          <Text>{f}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={f === "password"}
            value={form[f]}
            onChangeText={(text) => setForm({ ...form, [f]: text })}
            placeholder={f}
            autoCapitalize={f === "email" ? "none" : "sentences"}
          />
        </View>
      ))}

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
  },
  inputGroup: {
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginTop: 5,
    borderRadius: 10,
    backgroundColor: "#fff",
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
