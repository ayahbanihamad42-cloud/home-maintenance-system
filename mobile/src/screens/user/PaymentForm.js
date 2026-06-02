import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
} from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

function PaymentForm({ route, navigation }) {
  const requestId = route?.params?.requestId || "";
  const amount = Number(route?.params?.amount || route?.params?.total_price || 0);

  const [form, setForm] = useState({
    nameOnCard: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  const totalAmount = useMemo(() => Number(amount || 0).toFixed(2), [amount]);

  const onlyNumbers = (value) => String(value || "").replace(/\D/g, "");
  const onlyLettersSpaces = (value) =>
    String(value || "").replace(/[^a-zA-Z\s]/g, "");

  const formatCardNumber = (value) => {
    const digits = onlyNumbers(value).slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value) => {
    let cleaned = String(value || "").replace(/[^\d/]/g, "");

    if (cleaned.startsWith("/")) cleaned = "";

    const digits = cleaned.replace(/\D/g, "").slice(0, 4);

    if (cleaned.includes("/")) {
      const month = digits.slice(0, 2);
      const year = digits.slice(2, 4);

      if (digits.length <= 2) return month ? `${month}/` : "";
      return `${month}/${year}`;
    }

    if (digits.length <= 2) return digits;

    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}`;
  };

  const setField = (key, value) => {
    setMessage(null);

    if (key === "nameOnCard") {
      setForm((prev) => ({ ...prev, nameOnCard: onlyLettersSpaces(value) }));
      return;
    }

    if (key === "cardNumber") {
      setForm((prev) => ({ ...prev, cardNumber: formatCardNumber(value) }));
      return;
    }

    if (key === "expiry") {
      setForm((prev) => ({ ...prev, expiry: formatExpiry(value) }));
      return;
    }

    if (key === "cvv") {
      setForm((prev) => ({ ...prev, cvv: onlyNumbers(value).slice(0, 4) }));
    }
  };

  const validate = () => {
    const name = form.nameOnCard.trim();
    const cardDigits = onlyNumbers(form.cardNumber);
    const expiry = form.expiry.trim();
    const cvv = form.cvv.trim();

    if (!requestId) return "Missing request ID.";
    if (!amount || amount <= 0) return "Invalid payment amount.";

    if (!name) return "Please enter the name on card.";
    if (!/^[a-zA-Z\s]{3,}$/.test(name)) {
      return "Name on card must contain letters only and at least 3 characters.";
    }

    if (cardDigits.length !== 16) {
      return "Card number must contain exactly 16 digits.";
    }

    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      return "Expiry date must be in MM/YY format, for example 12/29.";
    }

    const [monthText, yearText] = expiry.split("/");
    const month = Number(monthText);
    const year = Number(`20${yearText}`);

    if (month < 1 || month > 12) {
      return "Expiry month must be between 01 and 12.";
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return "Card expiry date cannot be in the past.";
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      return "CVV must contain 3 or 4 digits only.";
    }

    return "";
  };

  const pay = async () => {
    try {
      const error = validate();

      if (error) {
        setMessage({ type: "error", text: error });
        return;
      }

      setLoading(true);
      setMessage(null);

      const res = await API.post(`/maintenance/${requestId}/online-payment`, {
        amount: Number(totalAmount),
        card_last_four: onlyNumbers(form.cardNumber).slice(-4),
      });

      const transactionId = res.data?.transactionId || `mock_txn_${Date.now()}`;

      navigation.navigate("PaymentSuccess", {
        requestId,
        amount: totalAmount,
        transactionId,
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Payment failed. Please check the information and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Payment" />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Payment Details</Text>
          <Text style={appStyles.heroSubtitle}>
            This is a mock online payment form for testing.
          </Text>
        </View>

        {message ? (
          <View
            style={
              message.type === "error" ? appStyles.errorBox : appStyles.successBox
            }
          >
            <Text
              style={
                message.type === "error"
                  ? appStyles.errorText
                  : appStyles.successText
              }
            >
              {message.text}
            </Text>
          </View>
        ) : null}

        <View style={appStyles.card}>
          <Text style={appStyles.text}>Request ID: {requestId || "-"}</Text>
          <Text style={appStyles.text}>Total Amount: {totalAmount} JOD</Text>

          <Text style={appStyles.label}>Name on Card</Text>
          <TextInput
            style={appStyles.input}
            value={form.nameOnCard}
            onChangeText={(v) => setField("nameOnCard", v)}
            placeholder="Aya Bani Hamad"
          />

          <Text style={appStyles.label}>Card Number</Text>
          <TextInput
            style={appStyles.input}
            value={form.cardNumber}
            onChangeText={(v) => setField("cardNumber", v)}
            placeholder="4242 4242 4242 4242"
            keyboardType="numeric"
            maxLength={19}
          />

          <Text style={appStyles.label}>Expiry</Text>
          <TextInput
            style={appStyles.input}
            value={form.expiry}
            onChangeText={(v) => setField("expiry", v)}
            placeholder="12/29"
            keyboardType="numeric"
            maxLength={5}
          />

          <Text style={appStyles.label}>CVV</Text>
          <TextInput
            style={appStyles.input}
            value={form.cvv}
            onChangeText={(v) => setField("cvv", v)}
            placeholder="123"
            keyboardType="numeric"
            maxLength={4}
          />

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={pay}
            disabled={loading}
          >
            <Text style={appStyles.primaryBtnText}>
              {loading ? "Processing..." : "Pay Now"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default PaymentForm;