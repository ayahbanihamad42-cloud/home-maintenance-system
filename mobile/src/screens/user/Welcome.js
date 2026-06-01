import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import appStyles, { colors } from "../../styles/mobileStyles";

const WelcomeScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={appStyles.safe}>
      <View style={[appStyles.pageContent, { flex: 1, justifyContent: "center" }]}>
        <Text style={{ fontSize: 64, fontWeight: "900", color: colors.primary, textAlign: "center" }}>
          خدمة
        </Text>

        <View style={[appStyles.hero, { marginTop: 26 }]}>
          <Text style={appStyles.heroTitle}>Home services made simple</Text>
          <Text style={appStyles.heroSubtitle}>
            Book technicians, manage requests, chat, pay online, and track your service.
          </Text>
        </View>

        <TouchableOpacity style={appStyles.primaryBtn} onPress={() => navigation.navigate("Register")}>
          <Text style={appStyles.primaryBtnText}>Create Account</Text>
        </TouchableOpacity>

        <TouchableOpacity style={appStyles.secondaryBtn} onPress={() => navigation.navigate("Login")}>
          <Text style={appStyles.secondaryBtnText}>Login</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

export default WelcomeScreen;