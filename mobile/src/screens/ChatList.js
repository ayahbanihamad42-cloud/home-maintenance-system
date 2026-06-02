import React, { useEffect } from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import Header from "../components/Common/Header";
import FloatingActions from "../components/Common/FloatingActions";
import appStyles from "../styles/mobileStyles";

function ChatList({ navigation }) {
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
            Open conversations using the floating chat card.
          </Text>
        </View>

        <View style={appStyles.card}>
          <Text style={appStyles.sectionTitle}>Chat card mode</Text>
          <Text style={appStyles.mutedText}>
            Tap the purple chat button at the bottom to open the chat list.
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

export default ChatList;