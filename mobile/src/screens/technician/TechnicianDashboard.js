import React from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import appStyles from "../../styles/mobileStyles";
import HeroSection from "../../components/Common/HeroSection";
const TechnicianDashboard = ({ navigation }) => {
  const cards = [
    ["📋", "Assigned Requests", "View and manage your requests.", "TechnicianRequests"],
    ["🕒", "Availability", "Set your available times.", "TechnicianAvailability"],
    ["🖼️", "Work Gallery", "Manage your profile gallery.", "UserProfile"],
  ];

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Technician Dashboard" />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <HeroSection 
         title="Welcome to خدمة"
          subtitle="Choose a service and book trusted technicians easily." />

        {cards.map(([icon, title, desc, screen]) => (
          <TouchableOpacity key={title} style={appStyles.card} onPress={() => navigation.navigate(screen)}>
            <Text style={{ fontSize: 34 }}>{icon}</Text>
            <Text style={appStyles.sectionTitle}>{title}</Text>
            <Text style={appStyles.mutedText}>{desc}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
};

export default TechnicianDashboard;