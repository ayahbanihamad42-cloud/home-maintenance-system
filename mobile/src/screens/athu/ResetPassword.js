// React hook for managing state
import { useState } from "react";

// Navigation utilities
import { useRoute, useNavigation } from "@react-navigation/native";

// Axios API instance
import API from "../../services/api";

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";

// Reset password page component
function ResetPassword() {
  // Get reset token from params
  const route = useRoute();
  const { token } = route.params;

  // Navigation hook
  const navigate = useNavigation();

  // Password input state
  const [password, setPassword] = useState("");

  // Confirm password input state
  const [confirmPassword, setConfirmPassword] = useState("");

  // Feedback message state
  const [message, setMessage] = useState("");

  // Loading state
  const [loading, setLoading] = useState(false);

  // Submit new password
  const submit = async () => {
    setMessage("");

    if (!password || !confirmPassword) {
      setMessage("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      setMessage("Password must be at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      // Call backend reset endpoint
      const res = await API.post(`/auth/reset-password/${token}`, { password });

      setMessage(res?.data?.message || "Password updated successfully.");

      // Redirect to login after short delay
      setTimeout(() => navigate.navigate("/login"), 900);
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to reset password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        {/* Page title */}
        <Text style={styles.title}>Reset Password</Text>

        {/* Page description */}
        <Text style={styles.subtitle}>
          Enter a new password for your account.
        </Text>

        {/* New password input */}
        <View style={styles.inputGroup}>
          <Text>New Password</Text>
          <TextInput
            style={styles.input}
            placeholder="New password"
            value={password}
            onChangeText={(text) => setPassword(text)}
            secureTextEntry
          />
        </View>

        {/* Confirm password input */}
        <View style={styles.inputGroup}>
          <Text>Confirm Password</Text>
          <TextInput
            style={styles.input}
            placeholder="Confirm password"
            value={confirmPassword}
            onChangeText={(text) => setConfirmPassword(text)}
            secureTextEntry
          />
        </View>

        {/* Feedback message */}
        {message ? <Text style={styles.message}>{message}</Text> : null}

        {/* Submit button */}
        <TouchableOpacity
          style={[styles.button, loading && { opacity: 0.6 }]}
          onPress={submit}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Updating..." : "Update Password"}
          </Text>
        </TouchableOpacity>

        {/* Back to login */}
        <TouchableOpacity onPress={() => navigate.navigate("/login")}>
          <Text style={styles.link}>Back to Login</Text>
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
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    marginBottom: 15,
    color: "#666",
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
  link: {
    color: "blue",
    textAlign: "center",
    marginTop: 10,
  },
});

export default ResetPassword;