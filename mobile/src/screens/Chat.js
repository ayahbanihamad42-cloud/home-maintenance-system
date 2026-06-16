import React, { useEffect } from "react";
import { SafeAreaView } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../context/ThemeContext";
import Header from "../components/Common/Header";
import FloatingActions from "../components/Common/FloatingActions";
import appStyles from "../styles/mobileStyles";

function Chat({ route, navigation }) {
  const { t } = useTranslation();
  const { c } = useTheme();

  useEffect(() => {
    const receiverId = route?.params?.receiverId;
    const receiverName = route?.params?.receiverName || t("nav.chat");

    setTimeout(() => {
      if (receiverId) {
        global.openMobileChatWith?.({
          id: receiverId,
          name: receiverName,
        });
      } else {
        global.openMobileChatCard?.();
      }
    }, 250);
  }, [route?.params?.receiverId]);

  return (
    <SafeAreaView style={[appStyles.safe, { backgroundColor: c.bg }]}>
      <Header navigation={navigation} title={t("nav.chat")} />
      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default Chat;