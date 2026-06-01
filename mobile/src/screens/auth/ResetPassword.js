import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity } from "react-native";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const ResetPasswordScreen = ({ route, navigation }) => {
  const token = route?.params?.token || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const reset = async () => {
    if (password !== confirm) {
      setMessage("Passwords do not match.");
      return;
    }

    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      setMessage(res.data?.message || "Password reset successfully.");
      setTimeout(() => navigation.navigate("Login"), 900);
    } catch (err) {
      setMessage(err.response?.data?.message || "Failed to reset password.");
    }
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <View style={[appStyles.pageContent, { flex: 1, justifyContent: "center" }]}>
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Reset Password</Text>
          <Text style={appStyles.heroSubtitle}>Create a new secure password.</Text>
        </View>

        <View style={appStyles.card}>
          {message ? <Text style={appStyles.mutedText}>{message}</Text> : null}

          <Text style={appStyles.label}>New Password</Text>
          <TextInput style={appStyles.input} value={password} onChangeText={setPassword} secureTextEntry />

          <Text style={appStyles.label}>Confirm Password</Text>
          <TextInput style={appStyles.input} value={confirm} onChangeText={setConfirm} secureTextEntry />

          <TouchableOpacity style={appStyles.primaryBtn} onPress={reset}>
            <Text style={appStyles.primaryBtnText}>Reset Password</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;