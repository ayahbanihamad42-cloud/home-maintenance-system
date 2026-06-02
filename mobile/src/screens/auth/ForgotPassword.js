import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    try {
      setMessage(null);

      if (!email.trim()) {
        setMessage({ type: "error", text: "Please enter your email." });
        return;
      }

      setLoading(true);

      const res = await API.post("/auth/forgotPassword", {
        email: email.trim(),
      });

      setMessage({
        type: "success",
        text: res.data?.message || "Reset link sent successfully.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to send reset link.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <View style={appStyles.authContent}>
        <Text style={appStyles.brandText}>خدمة</Text>

        <View style={appStyles.authCard}>
          <Text style={appStyles.pageTitle}>Forgot Password</Text>
          <Text style={appStyles.mutedText}>
            Enter your email to receive a reset link.
          </Text>

          {message && (
            <View
              style={
                message.type === "error"
                  ? appStyles.errorBox
                  : appStyles.successBox
              }
            >
              <Text
                style={
                  message.type === "error"
                    ? appStyles.errorText
                    : appStyles.successText
                }
              >
                {message.text}
              </Text>
            </View>
          )}

          <Text style={appStyles.label}>Email</Text>
          <TextInput
            style={appStyles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={send}
            disabled={loading}
          >
            <Text style={appStyles.primaryBtnText}>
              {loading ? "Sending..." : "Send Reset Link"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={appStyles.secondaryBtn}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={appStyles.secondaryBtnText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;