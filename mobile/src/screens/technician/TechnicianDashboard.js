import React from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import appStyles from "../../styles/mobileStyles";
import HeroSection from "../../components/Common/HeroSection";
const TechnicianDashboard = ({ navigation }) => {
  const { t } = useTranslation();
  const { c } = useTheme();

  const cards = [
    ["📋", t("techDashboard.assignedRequests"), t("techDashboard.assignedRequestsDesc"), "TechnicianRequests"],
    ["🕒", t("techDashboard.availability"), t("techDashboard.availabilityDesc"), "TechnicianAvailability"],
    ["🖼️", t("techDashboard.workGallery"), t("techDashboard.workGalleryDesc"), "UserProfile"],
  ];

  return (
    <SafeAreaView style={[appStyles.safe, { backgroundColor: c.bg }]}>
      <Header navigation={navigation} title={t("techDashboard.title")} />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <HeroSection
         title={t("techDashboard.heroTitle")}
          subtitle={t("techDashboard.heroSubtitle")} />

        {cards.map(([icon, title, desc, screen]) => (
          <TouchableOpacity key={title} style={[appStyles.card, { backgroundColor: c.card }]} onPress={() => navigation.navigate(screen)}>
            <Text style={{ fontSize: 34 }}>{icon}</Text>
            <Text style={[appStyles.sectionTitle, { color: c.text }]}>{title}</Text>
            <Text style={[appStyles.mutedText, { color: c.muted }]}>{desc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
};

export default TechnicianDashboard;