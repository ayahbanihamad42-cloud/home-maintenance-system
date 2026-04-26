import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { login } from "../../services/auth.service.js";
import welomeimage from "../../assets/home.png";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const navigation = useNavigation();

  const handleSubmit = async () => {
    try {
      const response = await login({ email, password });

      setSuccessMessage("Login successful. Redirecting...");

      setTimeout(() => {
        const role = String(response?.user?.role || "").toLowerCase();

        if (role === "admin") {
          navigation.replace("AdminDashboard");
          return;
        }

        if (role === "technician") {
          navigation.replace("TechnicianDashboard");
          return;
        }

        navigation.replace("Home");
      }, 900);
    } catch (err) {
      const msg =
        err.response?.data?.message || "Login failed. Check your credentials.";

      console.error(msg);
      Alert.alert("Error", msg);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        <Text style={styles.title}>Welcome back</Text>

        <Text style={styles.subtitle}>
          Sign in to manage your maintenance requests.
        </Text>

        {successMessage ? (
          <Text style={styles.success}>{successMessage}</Text>
        ) : null}

        <View style={styles.inputGroup}>
          <Text>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        <Image
          style={styles.image}
          source={welomeimage}
          resizeMode="contain"
        />

        <Text style={styles.message}>
          We’re ready to help you keep your home running smoothly.
        </Text>

        <TouchableOpacity onPress={() => navigation.navigate("Register")}>
          <Text style={styles.link}>Don't have an account? Register</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
          <Text style={styles.link}>Forgot password?</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#E8DCCF",
  },
  card: {
    backgroundColor: "#FFF9F3",
    padding: 20,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#111",
  },
  subtitle: {
    color: "#666",
    marginBottom: 15,
  },
  success: {
    color: "green",
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 15,
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
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "700",
  },
  image: {
    width: "100%",
    height: 150,
    marginBottom: 10,
  },
  message: {
    textAlign: "center",
    marginBottom: 10,
    color: "#555",
  },
  link: {
    color: "#2563eb",
    textAlign: "center",
    marginTop: 5,
  },
});

export default Login;
