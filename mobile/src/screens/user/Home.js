import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity } from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const HomeScreen = ({ navigation }) => {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await API.get("/services");
        setServices(Array.isArray(res.data) ? res.data : []);
      } catch {
        setServices([]);
      }
    };
    load();
  }, []);

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Home" />

      <ScrollView style={appStyles.scroll} contentContainerStyle={appStyles.pageContent}>
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Welcome to خدمة</Text>
          <Text style={appStyles.heroSubtitle}>
            Choose a service and book trusted technicians easily.
          </Text>
        </View>

        <Text style={appStyles.sectionTitle}>Services</Text>

        <View style={appStyles.grid}>
          {services.map((service) => (
            <TouchableOpacity
              key={service.id || service.name}
              style={appStyles.serviceCard}
              onPress={() =>
                navigation.navigate("TechniciansByService", { service: service.name })
              }
            >
              <View style={appStyles.serviceIcon}>
                <Text style={{ fontSize: 30 }}>🛠️</Text>
              </View>
              <Text style={appStyles.serviceName}>{service.name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
};

export default HomeScreen;