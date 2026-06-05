import React, { useEffect } from "react";
import { SafeAreaView } from "react-native";
import Header from "../components/Common/Header";
import FloatingActions from "../components/Common/FloatingActions";
import appStyles from "../styles/mobileStyles";

function AIChat({ navigation }) {
  useEffect(() => {
    setTimeout(() => {
      global.openMobileAICard?.();
    }, 250);
  }, []);

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="AI Assistant" />
      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default AIChat;