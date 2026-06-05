import React, { useEffect } from "react";
import { SafeAreaView } from "react-native";
import Header from "../components/Common/Header";
import FloatingActions from "../components/Common/FloatingActions";
import appStyles from "../styles/mobileStyles";

function Chat({ route, navigation }) {
  useEffect(() => {
    const receiverId = route?.params?.receiverId;
    const receiverName = route?.params?.receiverName || "Chat";

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
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Chat" />
      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default Chat;