import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity } from "react-native";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const ForgotPasswordScreen = ({ navigation }) => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");

  const send = async () => {
    try {
      const res = await API.post("/auth/forgotPassword", { email });
      setMessage(res.data?.message || "Reset link sent successfully.");
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to send reset link.");
    }
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <View style={[appStyles.pageContent, { flex: 1, justifyContent: "center" }]}>
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Forgot Password</Text>
          <Text style={appStyles.heroSubtitle}>Enter your email to receive a reset link.</Text>
        </View>

        <View style={appStyles.card}>
          {message ? <Text style={appStyles.mutedText}>{message}</Text> : null}

          <Text style={appStyles.label}>Email</Text>
          <TextInput
            style={appStyles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="example@email.com"
            autoCapitalize="none"
          />

          <TouchableOpacity style={appStyles.primaryBtn} onPress={send}>
            <Text style={appStyles.primaryBtnText}>Send Reset Link</Text>
          </TouchableOpacity>

          <TouchableOpacity style={appStyles.secondaryBtn} onPress={() => navigation.navigate("Login")}>
            <Text style={appStyles.secondaryBtnText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;