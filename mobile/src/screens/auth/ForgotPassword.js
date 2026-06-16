import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import API from "../../services/api";
import appStyles, { getStyles } from "../../styles/mobileStyles";

const ForgotPasswordScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { c } = useTheme();
  const appS = getStyles(c);

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
        text: res.data?.message || t("forgot.success"),
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || t("forgot.failed"),
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[appS.safe, { backgroundColor: c.bg }]}>
      <View style={appS.authContent}>
        <Text style={[appS.brandText, { color: c.primary }]}>{t("brand")}</Text>

        <View style={[appS.authCard, { backgroundColor: c.card, borderColor: c.border }]}>
          <Text style={[appS.pageTitle, { color: c.text }]}>{t("forgot.title")}</Text>
          <Text style={[appS.mutedText, { color: c.muted }]}>
            {t("forgot.subtitle")}
          </Text>

          {message && (
            <View
              style={
                message.type === "error"
                  ? appS.errorBox
                  : appS.successBox
              }
            >
              <Text
                style={
                  message.type === "error"
                    ? appS.errorText
                    : appS.successText
                }
              >
                {message.text}
              </Text>
            </View>
          )}

          <Text style={[appS.label, { color: c.text }]}>{t("forgot.email")}</Text>
          <TextInput
            style={[appS.input, { color: c.text, backgroundColor: c.inputBg, borderColor: c.border }]}
            value={email}
            onChangeText={setEmail}
            placeholder={t("forgot.emailPlaceholder")}
            placeholderTextColor={c.muted}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <TouchableOpacity
            style={appS.primaryBtn}
            onPress={send}
            disabled={loading}
          >
            <Text style={appS.primaryBtnText}>
              {loading ? t("forgot.submit") + "..." : t("forgot.submit")}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={appS.secondaryBtn}
            onPress={() => navigation.navigate("Login")}
          >
            <Text style={appS.secondaryBtnText}>{t("forgot.backToLogin")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ForgotPasswordScreen;