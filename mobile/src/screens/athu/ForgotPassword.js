// React hook for managing state
import { useState } from "react";

// Axios API instance
import API from "../../services/api";

// React Native components
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet
} from "react-native";

// Forgot password page component
function ForgotPassword() {
  // Email input state
  const [email, setEmail] = useState("");

  // Message feedback state
  const [message, setMessage] = useState("");

  // Loading state for submit action
  const [loading, setLoading] = useState(false);

  // Handle submit action
  const submit = async () => {
    if (!email) {
      setMessage("Please enter your email.");
      return;
    }

    try {
      setLoading(true);

      // Send forgot password request (email only)
      const res = await API.post("/auth/forgotPassword", { email });

      setMessage(res?.data?.message || "Reset link sent to your email.");
      setEmail("");
    } catch (error) {
      setMessage(error.response?.data?.message || "Failed to send reset link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.page}>
      <View style={styles.card}>
        {/* Page title */}
        <Text style={styles.title}>Forgot Password</Text>

        {/* Page description */}
        <Text style={styles.subtitle}>
          Enter your email to receive a password reset link.
        </Text>

        {/* Email input */}
        <View style={styles.inputGroup}>
          <Text>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="name@example.com"
            value={email}
            onChangeText={(text) => setEmail(text)}
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
            {loading ? "Sending..." : "Send Reset Link"}
          </Text>
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
});

export default ForgotPassword;