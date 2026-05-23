import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";
import Header from "../../components/Common/Header";
import API from "../../services/api";

function getBackendBaseUrl() {
  const baseURL = API?.defaults?.baseURL || "";
  return String(baseURL).replace(/\/api\/?$/, "");
}

function getBackendImageUrl(imageUrl) {
  if (!imageUrl) return "";

  const value = String(imageUrl).trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/")
  ) {
    return value;
  }

  const cleanPath = value.startsWith("/") ? value : `/${value}`;
  return `${getBackendBaseUrl()}${cleanPath}`;
}

export default function Home({ navigation }) {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/admin/services")
      .then((res) => {
        setServices(Array.isArray(res.data) ? res.data : []);
      })
      .catch((err) => {
        console.log("load services error:", err?.response?.data || err.message);
        setServices([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.homeContainer}>
        <Text style={styles.homeTitle}>Welcome to our services:</Text>

        {loading ? (
          <ActivityIndicator color="#111" size="large" style={{ marginTop: 30 }} />
        ) : (
          <View style={styles.servicesContainer}>
            {services.map((service) => (
              <View style={styles.serviceItem} key={service.id}>
                <TouchableOpacity
                  style={styles.serviceCircle}
                  activeOpacity={0.85}
                  onPress={() =>
                    navigation.navigate("TechniciansByService", {
                      service: service.name,
                    })
                  }
                >
                  {service.image_url ? (
                    <Image
                      source={{ uri: getBackendImageUrl(service.image_url) }}
                      style={styles.serviceImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <Text style={styles.fallbackIcon}>🛠️</Text>
                  )}
                </TouchableOpacity>

                <Text style={styles.serviceName}>{service.name}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DCCF",
  },
  homeContainer: {
    flexGrow: 1,
    backgroundColor: "#E8DCCF",
    paddingHorizontal: 18,
    paddingTop: 34,
    paddingBottom: 80,
    alignItems: "center",
  },
  homeTitle: {
    color: "#111",
    fontSize: 38,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 34,
  },
  servicesContainer: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceItem: {
    width: "48%",
    alignItems: "center",
    marginBottom: 34,
  },
  serviceCircle: {
    width: 145,
    height: 145,
    borderRadius: 73,
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  serviceImage: {
    width: "100%",
    height: "100%",
    borderRadius: 73,
  },
  fallbackIcon: {
    fontSize: 48,
  },
  serviceName: {
    color: "#111",
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
});