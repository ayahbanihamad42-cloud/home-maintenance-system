import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../services/api";
import appStyles, { colors } from "../../styles/mobileStyles";

const LoginScreen = ({ navigation }) => {
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  const login = async () => {
    try {
      setError("");
      const res = await API.post("/auth/login", form);

      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));

      const role = String(res.data.user?.role || "").toLowerCase();

      if (role === "admin") navigation.reset({ index: 0, routes: [{ name: "AdminDashboard" }] });
      else if (role === "technician") navigation.reset({ index: 0, routes: [{ name: "TechnicianDashboard" }] });
      else navigation.reset({ index: 0, routes: [{ name: "Home" }] });
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    }
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <View style={[appStyles.pageContent, { flex: 1, justifyContent: "center" }]}>
        <Text style={{ fontSize: 52, fontWeight: "900", color: colors.primary, textAlign: "center" }}>
          خدمة
        </Text>

        <View style={appStyles.card}>
          <Text style={appStyles.pageTitle}>Login</Text>
          <Text style={appStyles.mutedText}>Enter your account information.</Text>

          {error ? (
            <View style={appStyles.errorBox}>
              <Text style={appStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={appStyles.label}>Email</Text>
          <TextInput
            style={appStyles.input}
            value={form.email}
            onChangeText={(v) => setForm({ ...form, email: v })}
            placeholder="example@email.com"
            autoCapitalize="none"
          />

          <Text style={appStyles.label}>Password</Text>
          <TextInput
            style={appStyles.input}
            value={form.password}
            onChangeText={(v) => setForm({ ...form, password: v })}
            placeholder="Password"
            secureTextEntry
          />

          <TouchableOpacity style={appStyles.primaryBtn} onPress={login}>
            <Text style={appStyles.primaryBtnText}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity style={appStyles.secondaryBtn} onPress={() => navigation.navigate("ForgotPassword")}>
            <Text style={appStyles.secondaryBtnText}>Forgot Password?</Text>
          </TouchableOpacity>

          <TouchableOpacity style={appStyles.secondaryBtn} onPress={() => navigation.navigate("Register")}>
            <Text style={appStyles.secondaryBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default LoginScreen;