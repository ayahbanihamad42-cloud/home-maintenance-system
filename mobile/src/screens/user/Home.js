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

const localFallbackImages = {
  Plumbing: require("../../assets/plumbing.png"),
  Electrical: require("../../assets/Electrical.png"),
  Painting: require("../../assets/Painting.png"),
  Decoration: require("../../assets/Decoration.png"),
};

function Home({ navigation }) {
  const [services, setServices] = useState([]);

  const getImageUrl = (url) => {
    if (!url) return "";
    if (String(url).startsWith("http")) return url;
    if (String(url).startsWith("data:image")) return url;

    const base = String(API.defaults.baseURL || "").replace(/\/api\/?$/, "");
    return `${base}${url}`;
  };

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
            const imageUrl = getImageUrl(
              service.image_url || service.image || service.service_image
            );

            return (
              <TouchableOpacity
                key={service.id || service.name}
                style={appStyles.serviceCard}
                onPress={() =>
                  navigation.navigate("TechniciansByService", {
                    service: service.name,
                    serviceId: service.id,
                  })
                }
              >
                <View style={appStyles.serviceIconCircle}>
                  {imageUrl ? (
                    <Image
                      source={{ uri: imageUrl }}
                      style={{ width: 92, height: 92, borderRadius: 22 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <Image
                      source={
                        localFallbackImages[service.name] ||
                        localFallbackImages.Plumbing
                      }
                      style={{ width: 92, height: 92, borderRadius: 22 }}
                      resizeMode="cover"
                    />
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