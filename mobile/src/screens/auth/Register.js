import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Image,
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
import DateTimePicker from "@react-native-community/datetimepicker";
import API from "../../services/api";
import appStyles, { colors } from "../../styles/mobileStyles";
import CustomDropdown from "../../components/Common/CustomDropdown";

const homeLogo = require("../../assets/home.png");

const cityOptions = [
  "Amman", "Irbid", "Zarqa", "Aqaba", "Mafraq", "Jerash",
  "Ajloun", "Madaba", "Karak", "Tafilah", "Maan", "Balqa"
].map((city) => ({ label: city, value: city }));

function Register({ navigation }) {
  const bubbleOne = useRef(new Animated.Value(0)).current;
  const bubbleTwo = useRef(new Animated.Value(0)).current;

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    dob: "",
    city: "",
    password: "",
  });

  const [showDate, setShowDate] = useState(false);
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const animateBubble = (value, delay = 0) => {
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, {
            toValue: 1,
            duration: 2800,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 2800,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    animateBubble(bubbleOne, 0);
    animateBubble(bubbleTwo, 900);
  }, [bubbleOne, bubbleTwo]);

  const bubbleOneMove = bubbleOne.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -18],
  });

  const bubbleTwoMove = bubbleTwo.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 16],
  });

  const setField = (key, value) => {
    setMessage(null);
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const formatDate = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const register = async () => {
    try {
      setMessage(null);

      if (!form.name.trim()) throw new Error("Please enter your name.");
      if (!form.email.trim()) throw new Error("Please enter your email.");
      if (!/^\S+@\S+\.\S+$/.test(form.email.trim())) {
        throw new Error("Please enter a valid email.");
      }
      if (!form.phone.trim()) throw new Error("Please enter your phone.");
      if (!form.city) throw new Error("Please select your city.");
      if (!form.dob) throw new Error("Please select your birth date.");
      if (!form.password || form.password.length < 6) {
        throw new Error("Password must be at least 6 characters.");
      }

      setLoading(true);

      await API.post("/auth/register", {
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city,
        dob: form.dob,
        password: form.password,
      });

      setMessage({
        type: "success",
        text: "Account created successfully. Please login.",
      });

      setTimeout(() => navigation.navigate("Login"), 900);
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to create account.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.authCard}>
            <ImageBackground
              source={homeLogo}
              style={styles.leftSide}
              imageStyle={styles.leftImage}
            >
              <View style={styles.leftOverlay}>
                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.bubble,
                    styles.bubbleOne,
                    { transform: [{ translateY: bubbleOneMove }] },
                  ]}
                />

                <Animated.View
                  pointerEvents="none"
                  style={[
                    styles.bubble,
                    styles.bubbleTwo,
                    { transform: [{ translateY: bubbleTwoMove }] },
                  ]}
                />

                <Text style={styles.brand}>خدمة</Text>
                <Text style={styles.heroTitle}>Create your account.</Text>
                <Text style={styles.heroText}>
                  Join us to manage your home maintenance services easily.
                </Text>
              </View>
            </ImageBackground>

            <View style={styles.rightSide}>
              <Text style={styles.title}>Register</Text>
              <Text style={styles.subtitle}>
                Create a customer account and start booking services.
              </Text>

              {message ? (
                <View style={message.type === "success" ? appStyles.successBox : appStyles.errorBox}>
                  <Text style={message.type === "success" ? appStyles.successText : appStyles.errorText}>
                    {message.text}
                  </Text>
                </View>
              ) : null}

              <Text style={styles.label}>Name</Text>
              <TextInput
                style={styles.input}
                value={form.name}
                onChangeText={(value) => setField("name", value)}
                placeholder="Full name"
                placeholderTextColor="#777"
              />

              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={form.email}
                onChangeText={(value) => setField("email", value)}
                placeholder="example@email.com"
                placeholderTextColor="#777"
                autoCapitalize="none"
                keyboardType="email-address"
              />

              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={form.phone}
                onChangeText={(value) => setField("phone", value.replace(/[^\d]/g, ""))}
                placeholder="07XXXXXXXX"
                placeholderTextColor="#777"
                keyboardType="phone-pad"
                maxLength={10}
              />

              <Text style={styles.label}>Date of Birth</Text>
              <TouchableOpacity
                style={styles.inputLike}
                activeOpacity={0.85}
                onPress={() => setShowDate(true)}
              >
                <Text style={form.dob ? styles.inputLikeText : styles.placeholderText}>
                  {form.dob || "Select date"}
                </Text>
                <Text style={styles.calendarIcon}>📅</Text>
              </TouchableOpacity>

              {showDate && (
                <DateTimePicker
                  value={form.dob ? new Date(form.dob) : new Date(2002, 0, 1)}
                  mode="date"
                  display={Platform.OS === "ios" ? "spinner" : "default"}
                  maximumDate={new Date()}
                  onChange={(event, selectedDate) => {
                    setShowDate(false);
                    if (selectedDate) setField("dob", formatDate(selectedDate));
                  }}
                />
              )}

              {/* الـ Dropdown يحتاج لمساحة مريحة أسفله */}
              <View style={{ marginTop: 10 }}>
                <CustomDropdown
                  label="City"
                  value={form.city}
                  placeholder="Select city..."
                  options={cityOptions}
                  onChange={(value) => setField("city", value)}
                />
              </View>

              <Text style={styles.label}>Password</Text>
              <TextInput
                style={styles.input}
                value={form.password}
                onChangeText={(value) => setField("password", value)}
                placeholder="Create password"
                placeholderTextColor="#777"
                secureTextEntry
              />

              <TouchableOpacity
                style={styles.primaryButton}
                activeOpacity={0.85}
                onPress={register}
                disabled={loading}
              >
                <Text style={styles.primaryText}>
                  {loading ? "Registering..." : "Register"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                <Text style={styles.link}>Already have an account? Login</Text>
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
    padding: 12,
  },

  authCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#E9DDF8",
    elevation: 4,
  },

  // ضغط حجم الهيدر العلوي بشكل كبير من 420 لـ 170 ليناسب حقول الإدخال الكثيرة
  leftSide: {
    minHeight: 170,
  },

  leftImage: {
    opacity: 0.22,
  },

  leftOverlay: {
    flex: 1,
    backgroundColor: "rgba(124,58,237,0.84)",
    paddingHorizontal: 24,
    paddingVertical: 16,
    justifyContent: "center",
    overflow: "hidden",
  },

  brand: {
    color: "#120D22",
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 4,
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 22,
    lineHeight: 28,
    fontWeight: "900",
    marginBottom: 4,
  },

  heroText: {
    color: "#FFFFFF",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
  },

  rightSide: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#FFFFFF",
  },

  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
  },

  subtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "700",
    marginTop: 4,
    marginBottom: 12,
  },

  label: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900",
    marginTop: 10,
    marginBottom: 4,
  },

  // تقليص ارتفاع الحقول لـ 52 لكي تظهر الشاشة كلها بوضوح عند تفعيل الكيبورد
  input: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E9DDF8",
    paddingHorizontal: 14,
    color: colors.text,
    fontSize: 15,
    backgroundColor: "#FFFFFF",
  },

  inputLike: {
    minHeight: 52,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E9DDF8",
    paddingHorizontal: 14,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  inputLikeText: {
    color: colors.text,
    fontSize: 15,
  },

  placeholderText: {
    color: "#777",
    fontSize: 15,
  },

  calendarIcon: {
    fontSize: 18,
  },

  primaryButton: {
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: colors.primaryDark,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    marginBottom: 10,
  },

  primaryText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },

  link: {
    color: colors.primaryDark,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 6,
  },

  bubble: {
    position: "absolute",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderRadius: 999,
  },

  bubbleOne: {
    width: 120,
    height: 120,
    right: -30,
    top: 20,
  },

  bubbleTwo: {
    width: 90,
    height: 90,
    left: -20,
    bottom: 10,
  },
});

export default Register;