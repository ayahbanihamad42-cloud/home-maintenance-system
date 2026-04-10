import React, { useState } from "react";
// React and useState hook

import { useNavigation } from "@react-navigation/native";
// Navigation بدل react-router

import { login } from "../../services/auth.service.jsx";
// Login service function

import welomeimage from "../../images/home.png";
// Illustration image

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from "react-native";

// Login page component
function Login() {

  // Email input state
  const [email, setEmail] = useState("");

  // Password input state
  const [password, setPassword] = useState("");

  // Success message state
  const [successMessage, setSuccessMessage] = useState("");

  // Navigation hook
  const navigate = useNavigation();

  // Handle form submission
  const handleSubmit = async () => {

    try {
      // Call login API
      await login({ email, password });

      // Show success message
      setSuccessMessage("Login successful. Redirecting...");

      // Redirect user to home page after delay
      setTimeout(() => {
        navigate.navigate("/home");
      }, 900);

    } catch (err) {
      // Get error message from response or fallback
      const msg =
        err.response?.data?.message ||
        "Login failed. Check your credentials.";

      // Log error for debugging
      console.error(msg);

      // Show error alert
      Alert.alert("Error", msg);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>

        {/* Page title */}
        <Text style={styles.title}>Welcome back</Text>

        {/* Page subtitle */}
        <Text style={styles.subtitle}>
          Sign in to manage your maintenance requests.
        </Text>

        {/* Success message */}
        {successMessage ? (
          <Text style={styles.success}>{successMessage}</Text>
        ) : null}

        {/* Login form */}

        {/* Email input */}
        <View style={styles.inputGroup}>
          <Text>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={text => setEmail(text)}
            placeholder="name@example.com"
          />
        </View>

        {/* Password input */}
        <View style={styles.inputGroup}>
          <Text>Password</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={text => setPassword(text)}
            placeholder="Enter your password"
            secureTextEntry
          />
        </View>

        {/* Submit button */}
        <TouchableOpacity style={styles.button} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>

        {/* Illustration image */}
        <Image
          style={styles.image}
          source={welomeimage}
          resizeMode="contain"
        />

        {/* Additional message */}
        <Text style={styles.message}>
          We’re ready to help you keep your home running smoothly.
        </Text>

        {/* Register link */}
        <TouchableOpacity onPress={() => navigate.navigate("/register")}>
          <Text style={styles.link}>Don't have an account? Register</Text>
        </TouchableOpacity>

        {/* Forgot password link */}
        <TouchableOpacity onPress={() => navigate.navigate("/forgot-password")}>
          <Text style={styles.link}>Forgot password?</Text>
        </TouchableOpacity>

      </View>
    </View>
  );
}

// Styles
const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  card: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
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
  },
  button: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    marginBottom: 15,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
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
    color: "blue",
    textAlign: "center",
    marginTop: 5,
  },
});

// Export component
export default Login;