import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import Header from "../../components/Common/Header";
import { useNavigation, useRoute } from "@react-navigation/native";
import appStyles from "../../styles/mobileStyles";

function PaymentSuccess() {
  const navigation = useNavigation();
  const route = useRoute();

  const { requestId, transactionId, totalPrice } = route.params || {};

  return (
    <SafeAreaView style={appStyles.screen}>
      <Header />

      <View style={appStyles.content}>
        <Text style={appStyles.title}>Payment Successful</Text>

        <View style={appStyles.card}>
          <Text style={appStyles.infoRow}>
            <Text style={appStyles.bold}>Request ID:</Text> {requestId}
          </Text>
          <Text style={appStyles.infoRow}>
            <Text style={appStyles.bold}>Transaction ID:</Text> {transactionId}
          </Text>
          <Text style={appStyles.infoRow}>
            <Text style={appStyles.bold}>Total Paid:</Text>{" "}
            {Number(totalPrice || 0).toFixed(2)} JOD
          </Text>
        </View>

        <TouchableOpacity
          style={appStyles.primaryBtn}
          onPress={() => navigation.navigate("Review", { requestId })}
        >
          <Text style={appStyles.primaryBtnText}>Go to Review</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

export default PaymentSuccess;
