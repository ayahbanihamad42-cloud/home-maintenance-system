import React, { useEffect } from "react";
import { SafeAreaView } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Common/Header";
import FloatingActions from "../components/Common/FloatingActions";
import appStyles from "../styles/mobileStyles";

function AIChat({ navigation }) {
  const { t } = useTranslation();
  const { c } = useTheme();

  useEffect(() => {
    setTimeout(() => {
      global.openMobileAICard?.();
    }, 250);
  }, []);

  return (
    <SafeAreaView style={[appStyles.safe, { backgroundColor: c.bg }]}>
      <Header navigation={navigation} title={t("nav.aiAssistant")} />
      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default AIChat;