import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import Header from "../../components/Common/Header";
import { getServices, getImageUrl } from "../../services/services";

function Home() {
  const navigation = useNavigation();

  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getServices()
      .then((data) => setServices(data || []))
      .catch((err) => {
        console.error("get services error:", err);
        setServices([]);
      })
      .finally(() => setLoading(false));
  }, []);

  const openService = (service) => {
    navigation.navigate("Services", {
      service: service.name,
    });
  };

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Home Maintenance Services</Text>
        <Text style={styles.subtitle}>Choose the service you need</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#111" />
        ) : services.length === 0 ? (
          <Text style={styles.emptyText}>No services available.</Text>
        ) : (
          <View style={styles.grid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id || service.name}
                style={styles.serviceItem}
                onPress={() => openService(service)}
                activeOpacity={0.85}
              >
                <View style={styles.serviceCircle}>
                  {service.image_url ? (
                    <Image
                      source={{ uri: getImageUrl(service.image_url) }}
                      style={styles.serviceImage}
                    />
                  ) : (
                    <Text style={styles.placeholderText}>
                      {String(service.name || "?").charAt(0)}
                    </Text>
                  )}
                </View>

                <Text style={styles.serviceName}>{service.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 18,
    backgroundColor: "#E8DCCF",
    flexGrow: 1,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B5E52",
    textAlign: "center",
    marginBottom: 26,
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 24,
    paddingBottom: 30,
  },
  serviceItem: {
    width: "42%",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceCircle: {
    width: 145,
    height: 145,
    borderRadius: 72.5,
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 4,
  },
  serviceImage: {
    width: "82%",
    height: "82%",
    resizeMode: "contain",
    borderRadius: 70,
  },
  serviceName: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "800",
    color: "#2F241C",
    textAlign: "center",
  },
  placeholderText: {
    fontSize: 42,
    fontWeight: "800",
    color: "#111",
  },
  emptyText: {
    marginTop: 20,
    color: "#3A3028",
    fontSize: 16,
    textAlign: "center",
  },
});

export default Home;