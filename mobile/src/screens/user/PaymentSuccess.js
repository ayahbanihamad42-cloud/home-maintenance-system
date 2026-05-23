import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";
import Header from "../../components/Common/Header";

function PaymentSuccess({ navigation, route }) {
  const {
    requestId,
    transactionId,
    totalPrice,
    amount,
    message,
  } = route.params || {};

  const finalAmount = Number(totalPrice || amount || 0);

  return (
    <SafeAreaView style={styles.screen}>
      <Header />

      <View style={styles.content}>
        <Text style={styles.title}>Payment Successful</Text>

        <View style={styles.successBox}>
          <Text style={styles.successTitle}>Success</Text>
          <Text style={styles.successText}>
            {message ||
              "Payment completed successfully. The technician received a mock deposit notification."}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.infoRow}>
            <Text style={styles.bold}>Request ID:</Text> {requestId}
          </Text>

          <Text style={styles.infoRow}>
            <Text style={styles.bold}>Transaction ID:</Text> {transactionId}
          </Text>

          <Text style={styles.infoRow}>
            <Text style={styles.bold}>Total Paid:</Text>{" "}
            {finalAmount.toFixed(2)} JOD
          </Text>
        </View>

        <TouchableOpacity
          style={styles.primaryBtn}
          onPress={() => navigation.navigate("Review", { requestId })}
        >
          <Text style={styles.primaryBtnText}>Go to Review</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DCCF",
  },
  content: {
    padding: 18,
    flex: 1,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111",
    marginBottom: 18,
  },
  successBox: {
    backgroundColor: "#F5FBF6",
    borderColor: "#CFE8D4",
    borderWidth: 1,
    borderRadius: 18,
    padding: 16,
    marginBottom: 18,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111",
    marginBottom: 6,
  },
  successText: {
    color: "#2F6A3F",
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: "#FFF9F3",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    padding: 18,
    marginBottom: 20,
  },
  infoRow: {
    fontSize: 17,
    color: "#3A3028",
    marginBottom: 12,
    lineHeight: 24,
  },
  bold: {
    fontWeight: "900",
    color: "#111",
  },
  primaryBtn: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 15,
    alignItems: "center",
  },
  primaryBtnText: {
    color: "#FFF",
    fontSize: 17,
    fontWeight: "900",
  },
});

export default PaymentSuccess;