import React from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import { getStyles } from "../../styles/mobileStyles";
import HeroSection from "../../components/Common/HeroSection";

function PaymentSuccess({ route, navigation }) {
  const { t } = useTranslation();
  const { c } = useTheme();
  const appStyles = getStyles(c);

  const requestId = route?.params?.requestId || "-";
  const amount = route?.params?.amount || "0.00";
  const transactionId = route?.params?.transactionId || `mock_txn_${Date.now()}`;

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title={t("paymentSuccess.headerTitle")} />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection
          title={t("paymentSuccess.title")}
          subtitle={t("paymentSuccess.subtitle")}
        />

        <View style={appStyles.card}>
          <Text style={{ fontSize: 58, textAlign: "center", marginBottom: 18 }}>
            ✅
          </Text>

          <Text style={appStyles.sectionTitle}>{t("paymentSuccess.successDetails")}</Text>

          <Text style={appStyles.text}>{t("paymentSuccess.requestId")}: {requestId}</Text>
          <Text style={appStyles.text}>{t("paymentSuccess.amount")}: {amount} JOD</Text>
          <Text style={appStyles.text}>{t("paymentSuccess.transactionId")}: {transactionId}</Text>

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={() => navigation.navigate("MaintenanceHistory")}
          >
            <Text style={appStyles.primaryBtnText}>{t("paymentSuccess.goToHistory")}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={appStyles.secondaryBtn}
            onPress={() => navigation.navigate("Home")}
          >
            <Text style={appStyles.secondaryBtnText}>{t("paymentSuccess.backHome")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default PaymentSuccess;
