import React from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import appStyles from "../../styles/mobileStyles";

function PaymentSuccess({ route, navigation }) {
  const requestId = route?.params?.requestId || "-";
  const amount = route?.params?.amount || "0.00";
  const transactionId = route?.params?.transactionId || `mock_txn_${Date.now()}`;

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Payment Success" />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Payment Successful</Text>
          <Text style={appStyles.heroSubtitle}>
            Your payment was completed and your request is ready.
          </Text>
        </View>

        <View style={appStyles.card}>
          <Text style={{ fontSize: 58, textAlign: "center", marginBottom: 18 }}>
            ✅
          </Text>

          <Text style={appStyles.sectionTitle}>Success Details</Text>

          <Text style={appStyles.text}>Request ID: {requestId}</Text>
          <Text style={appStyles.text}>Amount: {amount} JOD</Text>
          <Text style={appStyles.text}>Transaction ID: {transactionId}</Text>

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={() => navigation.navigate("MaintenanceHistory")}
          >
            <Text style={appStyles.primaryBtnText}>Go to History</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={appStyles.secondaryBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={appStyles.secondaryBtnText}>Back Home</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default PaymentSuccess;