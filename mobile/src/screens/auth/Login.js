import React, { useState } from "react";
import {
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../services/api";
import appStyles, { colors } from "../../styles/mobileStyles";

const heroImage = {
  uri: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=80",
};

function Login({ navigation }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const updateField = (key, value) => {
    setError("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const login = async () => {
    try {
      setError("");

      if (!form.email.trim() || !form.password) {
        setError("Please enter email and password.");
        return;
      }

      setLoading(true);

      const res = await API.post("/auth/login", {
        email: form.email.trim(),
        password: form.password,
      });

      const token = res.data?.token;
      const user = res.data?.user;

      if (!token || !user) {
        setError("Invalid login response.");
        return;
      }

      await AsyncStorage.setItem("token", token);
      await AsyncStorage.setItem("user", JSON.stringify(user));

      const role = String(user.role || "user").toLowerCase();

      if (role === "admin") {
        navigation.reset({
          index: 0,
          routes: [{ name: "AdminDashboard" }],
        });
      } else if (role === "technician") {
        navigation.reset({
          index: 0,
          routes: [{ name: "TechnicianDashboard" }],
        });
      } else {
        navigation.reset({
          index: 0,
          routes: [{ name: "Home" }],
        });
      }
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.authCard}>
            <ImageBackground
              source={heroImage}
              style={styles.leftSide}
              imageStyle={styles.leftImage}
            >
              <View style={styles.leftOverlay}>
                <Text style={styles.brand}>خدمة</Text>

                <Text style={styles.heroTitle}>Welcome back.</Text>

                <Text style={styles.heroText}>
                  Sign in to manage your maintenance requests, chat with
                  technicians, review services, and continue your bookings.
                </Text>

                <View style={styles.iconCard}>
                  <Text style={styles.iconText}>🏠</Text>
                </View>
              </View>
            </ImageBackground>

            <View style={styles.rightSide}>
              <Text style={styles.title}>Login</Text>
              <Text style={styles.subtitle}>
                Enter your account information to continue.
              </Text>

              {error ? (
                <View style={appStyles.errorBox}>
                  <Text style={appStyles.errorText}>{error}</Text>
                </View>
              ) : null}

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(value) => updateField("email", value)}
                placeholder="example@email.com"
                placeholderTextColor="#777"
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(value) => updateField("password", value)}
                placeholder="Enter password"
                placeholderTextColor="#777"
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.primaryButton}
                onPress={login}
                disabled={loading}
              >
                <Text style={styles.primaryText}>
                  {loading ? "Logging in..." : "Login"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={styles.link}>
                  Don&apos;t have an account? Register
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("ForgotPassword")}
              >
                <Text style={styles.link}>Forgot password?</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FDF8FF",
  },

  flex: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 18,
  },

  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 36,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9DDF8",
    shadowColor: "#5B21B6",
    shadowOpacity: 0.16,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },

  leftSide: {
    minHeight: 360,
  },

  leftImage: {
    opacity: 0.28,
  },

  leftOverlay: {
    flex: 1,
    backgroundColor: "rgba(124,58,237,0.82)",
    padding: 30,
    justifyContent: "center",
  },

  brand: {
    color: "#120D22",
    fontSize: 44,
    fontWeight: "900",
    marginBottom: 34,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 36,
    lineHeight: 44,
    fontWeight: "900",
    marginBottom: 22,
  },

  heroText: {
    color: "#FFFFFF",
    fontSize: 17,
    lineHeight: 29,
    fontWeight: "800",
  },

  iconCard: {
    width: 142,
    height: 122,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,0.22)",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 34,
  },

  iconText: {
    fontSize: 76,
  },

  rightSide: {
    padding: 30,
    backgroundColor: "#FFFFFF",
  },

  title: {
    color: colors.text,
    fontSize: 42,
    fontWeight: "900",
  },

  subtitle: {
    color: colors.muted,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "800",
    marginTop: 12,
    marginBottom: 24,
  },

  label: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 9,
    marginTop: 16,
  },

  input: {
    minHeight: 62,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E9DDF8",
    paddingHorizontal: 16,
    color: colors.text,
    fontSize: 17,
    backgroundColor: "#FFFFFF",
  },

  primaryButton: {
    minHeight: 62,
    borderRadius: 22,
    backgroundColor: colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 26,
    marginBottom: 14,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  link: {
    color: colors.primaryDark,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10,
  },
});

export default Login;