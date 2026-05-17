import React, { useState } from "react";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
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
  ActivityIndicator,
} from "react-native";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const navigation = useNavigation();

  const handleSubmit = async () => {
    if (loading) return;

    if (!email.trim() || !password.trim()) {
      Alert.alert("Error", "Please enter email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await login({
        email: email.trim(),
        password: password.trim(),
      });

      console.log("LOGIN RESPONSE:", response);

      const token = response?.token;
      const user = response?.user;

      if (!token || !user) {
        Alert.alert("Error", "Login response is missing token or user.");
        return;
      }

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      setSuccessMessage("Login successful. Redirecting...");

      const role = String(user?.role || "").trim().toLowerCase();

      setTimeout(() => {
        if (role === "admin") {
          navigation.reset({
            index: 0,
            routes: [{ name: "AdminDashboard" }],
          });
          return;
        }

        if (role === "technician") {
          navigation.reset({
            index: 0,
            routes: [{ name: "TechnicianDashboard" }],
          });
          return;
        }

        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }, 500);
    } catch (err) {
      console.error("LOGIN ERROR:", err?.response?.data || err?.message || err);

      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Login failed. Check your credentials.";

      Alert.alert("Error", msg);
    } finally {
      setLoading(false);
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
          <Text style={styles.label}>Email</Text>

          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="name@example.com"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Password</Text>

          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            autoCapitalize="none"
          />
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.disabledButton]}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </TouchableOpacity>

        <Image style={styles.image} source={welomeimage} resizeMode="contain" />

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
    fontSize: 30,
    fontWeight: "800",
    marginBottom: 14,
    color: "#111",
  },
  subtitle: {
    color: "#666",
    marginBottom: 18,
    fontSize: 16,
    lineHeight: 22,
  },
  success: {
    color: "green",
    marginBottom: 10,
    fontWeight: "700",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    color: "#111",
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: "#D8C8B8",
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#FFF9F3",
    color: "#111",
  },
  button: {
    backgroundColor: "#111",
    padding: 15,
    borderRadius: 12,
    marginBottom: 18,
    minHeight: 52,
    justifyContent: "center",
  },
  disabledButton: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
    fontSize: 16,
  },
  image: {
    width: "100%",
    height: 150,
    marginBottom: 12,
  },
  message: {
    textAlign: "center",
    marginBottom: 14,
    color: "#555",
    fontSize: 16,
    lineHeight: 22,
  },
  link: {
    color: "#2563eb",
    textAlign: "center",
    marginTop: 8,
    fontSize: 16,
  },
});

export default Login;