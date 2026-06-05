import React, { useMemo, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

function PaymentForm({ route, navigation }) {
  const params = route?.params || {};
  const requestDraft = params.requestDraft || null;
  const amount = Number(params.amount || requestDraft?.total_price || 0);

  const [form, setForm] = useState({
    cardName: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const cleanCardNumber = useMemo(
    () => form.cardNumber.replace(/\s/g, ""),
    [form.cardNumber]
  );

  const formatCardNumber = (value) => {
    const nums = value.replace(/\D/g, "").slice(0, 16);
    return nums.replace(/(.{4})/g, "$1 ").trim();
  };

  const formatExpiry = (value) => {
    const nums = value.replace(/\D/g, "").slice(0, 4);
    if (nums.length <= 2) return nums;
    return `${nums.slice(0, 2)}/${nums.slice(2)}`;
  };

  const validate = () => {
    const name = form.cardName.trim();

    if (!requestDraft) return "Request information is missing.";
    if (name.length < 3) return "Name on card must be at least 3 characters.";
    if (!/^[A-Za-z\s]+$/.test(name)) return "Name on card must contain letters only.";
    if (cleanCardNumber.length !== 16) return "Card number must be 16 digits.";
    if (!/^\d{2}\/\d{2}$/.test(form.expiry)) return "Expiry must be MM/YY.";

    const [month, year] = form.expiry.split("/").map(Number);
    if (month < 1 || month > 12) return "Expiry month must be between 01 and 12.";

    const now = new Date();
    const currentYear = Number(String(now.getFullYear()).slice(2));
    const currentMonth = now.getMonth() + 1;

    if (year < currentYear || (year === currentYear && month < currentMonth)) {
      return "Card is expired.";
    }

    if (!/^\d{3,4}$/.test(form.cvv)) return "CVV must be 3 or 4 digits.";
    if (!amount || amount <= 0) return "Invalid payment amount.";

    return "";
  };

  const submitPayment = async () => {
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError("");

      const createRes = await API.post("/maintenance", requestDraft);

      const requestId =
        createRes.data?.requestId ||
        createRes.data?.request_id ||
        createRes.data?.id ||
        createRes.data?.insertId;

      if (!requestId) {
        throw new Error("Request id was not returned.");
      }

      await API.post(`/maintenance/${requestId}/online-payment`, {
        amount,
        card_name: form.cardName.trim(),
        card_number: cleanCardNumber,
        expiry: form.expiry,
        cvv: form.cvv,
      });

      Alert.alert("Success", "Payment completed successfully.");

      navigation.reset({
        index: 0,
        routes: [
          {
            name: "PaymentSuccess",
            params: { requestId, amount },
          },
        ],
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Payment failed. Request was not completed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Payment" />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={appStyles.pageContent}
          keyboardShouldPersistTaps="handled"
        >
          <HeroSection
            title="Payment"
            subtitle="Complete your online payment securely."
          />

          {error ? (
            <View style={appStyles.errorBox}>
              <Text style={appStyles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={appStyles.card}>
            <Text style={appStyles.text}>
              Request: Will be created after payment
            </Text>
            <Text style={appStyles.text}>
              Total Amount: {amount.toFixed(2)} JOD
            </Text>

            <Text style={appStyles.label}>Name on Card</Text>
            <TextInput
              style={appStyles.input}
              value={form.cardName}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, cardName: value }))
              }
              placeholder="Aya Bani Hamad"
              autoCapitalize="words"
              keyboardType="default"
            />

            <Text style={appStyles.label}>Card Number</Text>
            <TextInput
              style={appStyles.input}
              value={form.cardNumber}
              onChangeText={(value) =>
                setForm((prev) => ({
                  ...prev,
                  cardNumber: formatCardNumber(value),
                }))
              }
              placeholder="4242 4242 4242 4242"
              keyboardType="number-pad"
              maxLength={19}
            />

            <Text style={appStyles.label}>Expiry</Text>
            <TextInput
              style={appStyles.input}
              value={form.expiry}
              onChangeText={(value) =>
                setForm((prev) => ({ ...prev, expiry: formatExpiry(value) }))
              }
              placeholder="MM/YY"
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />

            <Text style={appStyles.label}>CVV</Text>
            <TextInput
              style={appStyles.input}
              value={form.cvv}
              onChangeText={(value) =>
                setForm((prev) => ({
                  ...prev,
                  cvv: value.replace(/\D/g, "").slice(0, 4),
                }))
              }
              placeholder="123"
              keyboardType="number-pad"
              secureTextEntry
              maxLength={4}
            />

            <TouchableOpacity
              style={appStyles.primaryBtn}
              onPress={submitPayment}
              disabled={loading}
            >
              <Text style={appStyles.primaryBtnText}>
                {loading ? "Processing..." : "Pay Now"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={appStyles.secondaryBtn}
              onPress={() => navigation.goBack()}
            >
              <Text style={appStyles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default PaymentForm;