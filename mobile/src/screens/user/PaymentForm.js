import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import Header from "../../components/Common/Header";
import { createPaymentIntent } from "../../services/paymentservice";

function PaymentForm({ route, navigation }) {
  const paymentData = route?.params || {};

  const [cardName, setCardName] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [saving, setSaving] = useState(false);

  const requestId = paymentData.requestId;
  const amount = Number(paymentData.amount || 0);

  const submitPayment = async () => {
    if (!cardName.trim() || !cardNumber.trim() || !expiry.trim() || !cvv.trim()) {
      Alert.alert("Notice", "Please fill all payment fields.");
      return;
    }

    try {
      setSaving(true);

      const payment = await createPaymentIntent({
        amount,
        requestId,
        technicianId: paymentData.technicianId,
        estimated_hours: paymentData.estimated_hours,
      });

      navigation.navigate("PaymentSuccess", {
        requestId,
        transactionId: payment.transactionId,
        amount,
      });
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || "Payment failed.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Payment Details</Text>
          <Text style={styles.subtitle}>Mock payment form for testing.</Text>

          <Text style={styles.label}>Request ID</Text>
          <TextInput style={styles.input} value={String(requestId || "")} editable={false} />

          <Text style={styles.label}>Total Amount</Text>
          <TextInput
            style={styles.input}
            value={`${amount.toFixed(2)} JOD`}
            editable={false}
          />

          <Text style={styles.label}>Name on Card</Text>
          <TextInput
            style={styles.input}
            value={cardName}
            onChangeText={setCardName}
            placeholder="Aya Bani Hamad"
          />

          <Text style={styles.label}>Card Number</Text>
          <TextInput
            style={styles.input}
            value={cardNumber}
            onChangeText={setCardNumber}
            placeholder="4242 4242 4242 4242"
            keyboardType="numeric"
            maxLength={19}
          />

          <View style={styles.row}>
            <View style={styles.half}>
              <Text style={styles.label}>Expiry</Text>
              <TextInput
                style={styles.input}
                value={expiry}
                onChangeText={setExpiry}
                placeholder="12/29"
                maxLength={5}
              />
            </View>

            <View style={styles.half}>
              <Text style={styles.label}>CVV</Text>
              <TextInput
                style={styles.input}
                value={cvv}
                onChangeText={setCvv}
                placeholder="123"
                keyboardType="numeric"
                maxLength={4}
              />
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, saving && { opacity: 0.6 }]}
            disabled={saving}
            onPress={submitPayment}
          >
            <Text style={styles.buttonText}>
              {saving ? "Processing..." : "Pay Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E8DCCF",
    flexGrow: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF9F3",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    padding: 18,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111",
    marginBottom: 6,
  },
  subtitle: {
    color: "#3A3028",
    marginBottom: 16,
  },
  label: {
    color: "#111",
    fontWeight: "900",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    color: "#111",
  },
  row: {
    flexDirection: "row",
    gap: 10,
  },
  half: {
    flex: 1,
  },
  button: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#FFF",
    fontWeight: "900",
  },
});

export default PaymentForm;