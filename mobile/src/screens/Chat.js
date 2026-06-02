import React, { useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import Header from "../components/Common/Header";
import FloatingActions from "../components/Common/FloatingActions";
import appStyles from "../styles/mobileStyles";

function Chat({ route, navigation }) {
  const receiverName = route?.params?.receiverName || "Chat";

  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.goBack();
    }, 150);

    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Chat" />

      <View style={appStyles.pageContent}>
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Chat</Text>
          <Text style={appStyles.heroSubtitle}>
            Use the chat button below to open your conversation with {receiverName}.
          </Text>
        </View>

        <View style={appStyles.card}>
          <Text style={appStyles.sectionTitle}>Chat opens as a card</Text>
          <Text style={appStyles.mutedText}>
            The conversation is available from the floating chat button.
          </Text>

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={() => navigation.goBack()}
          >
            <Text style={appStyles.primaryBtnText}>Back</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default Chat;