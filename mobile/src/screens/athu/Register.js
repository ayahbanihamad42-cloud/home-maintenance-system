import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { register } from "../../services/auth.service.jsx";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView
} from "react-native";

// Register page component
function Register() {
  // Form state to store user input values
  const [form, setForm] = useState({});

  // Navigation hook
  const navigate = useNavigation();

  // Handle form submission
  const handleSubmit = async () => {
    try {
      await register(form);
      navigate.navigate("/login");
    } catch (err) {
      const msg =
        err.response?.data?.message || "Registration failed.";
      Alert.alert("Error", msg);
      console.error("Register error:", err);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Page title */}
      <Text style={styles.title}>Register</Text>

      {/* Registration form */}
      {["name", "email", "phone", "dob", "city", "password"].map((f) => (
        <View style={styles.inputGroup} key={f}>
          <Text>{f}</Text>
          <TextInput
            style={styles.input}
            secureTextEntry={f === "password"}
            onChangeText={(text) =>
              setForm({ ...form, [f]: text })
            }
            placeholder={f}
          />
        </View>
      ))}

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      {/* Login page link */}
      <TouchableOpacity onPress={() => navigate.navigate("/login")}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

// Styles
const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 15,
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
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    marginTop: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
  link: {
    color: "blue",
    textAlign: "center",
    marginTop: 15,
  },
});

export default Register;