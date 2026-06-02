import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
} from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const serviceFallback = {
  Plumbing: "🔧",
  Electrical: "💡",
  Painting: "🎨",
  Decoration: "🏠",
};

function Home({ navigation }) {
  const [services, setServices] = useState([]);

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await API.get("/services");
        setServices(Array.isArray(res.data) ? res.data : []);
      } catch {
        setServices([]);
      }
    };

    loadServices();
  }, []);

  const fixedServices = useMemo(() => {
    if (services.length > 0) return services;

    return [
      { id: 1, name: "Plumbing" },
      { id: 2, name: "Electrical" },
      { id: 3, name: "Painting" },
      { id: 4, name: "Decoration" },
    ];
  }, [services]);

  const getImageUrl = (url) => {
    if (!url) return "";
    if (String(url).startsWith("http")) return url;
    return `http://localhost:5000${url}`;
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Home" />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <HeroSection
          title="Welcome to خدمة"
          subtitle="Choose a service and book trusted technicians easily."
        />

        <Text style={appStyles.sectionTitle}>Services</Text>

        <View style={appStyles.grid}>
          {fixedServices.map((service) => {
            const imageUrl = getImageUrl(service.image_url || service.image);

            return (
              <TouchableOpacity
                key={service.id || service.name}
                style={appStyles.serviceCard}
                onPress={() =>
                  navigation.navigate("TechniciansByService", {
                    service: service.name,
                  })
                }
              >
                <View style={appStyles.serviceIconCircle}>
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={{ width: 76, height: 76, borderRadius: 20 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={{ fontSize: 46 }}>
                      {serviceFallback[service.name] || "🛠️"}
                    </Text>
                  )}
                </View>

                <Text style={appStyles.serviceName} numberOfLines={1}>
                  {service.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default Home;