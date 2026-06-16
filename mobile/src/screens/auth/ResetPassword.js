import React, { useState } from "react";
import { SafeAreaView, View, Text, TextInput, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import API from "../../services/api";
import appStyles, { getStyles } from "../../styles/mobileStyles";

const ResetPasswordScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { c } = useTheme();
  const appS = getStyles(c);

  const token = route?.params?.token || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");

  const reset = async () => {
    if (password !== confirm) {
      setMessage(t("reset.mismatch"));
      return;
    }

    try {
      const res = await API.post(`/auth/reset-password/${token}`, { password });
      setMessage(res.data?.message || t("reset.success"));
      setTimeout(() => navigation.navigate("Login"), 900);
    } catch (err) {
      setMessage(err.response?.data?.message || t("reset.failed"));
    }
  };

  return (
    <SafeAreaView style={[appS.safe, { backgroundColor: c.bg }]}>
      <View style={[appS.pageContent, { flex: 1, justifyContent: "center" }]}>
        <View style={appS.hero}>
          <Text style={appS.heroTitle}>{t("reset.title")}</Text>
          <Text style={appS.heroSubtitle}>{t("reset.subtitle")}</Text>
        </View>

        <View style={[appS.card, { backgroundColor: c.card, borderColor: c.border }]}>
          {message ? <Text style={[appS.mutedText, { color: c.muted }]}>{message}</Text> : null}

          <Text style={[appS.label, { color: c.text }]}>{t("reset.newPassword")}</Text>
          <TextInput style={[appS.input, { color: c.text, backgroundColor: c.inputBg, borderColor: c.border }]} value={password} onChangeText={setPassword} secureTextEntry placeholderTextColor={c.muted} />

          <Text style={[appS.label, { color: c.text }]}>{t("reset.confirmPassword")}</Text>
          <TextInput style={[appS.input, { color: c.text, backgroundColor: c.inputBg, borderColor: c.border }]} value={confirm} onChangeText={setConfirm} secureTextEntry placeholderTextColor={c.muted} />

          <TouchableOpacity style={appS.primaryBtn} onPress={reset}>
            <Text style={appS.primaryBtnText}>{t("reset.submit")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

export default ResetPasswordScreen;