import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Image,
} from "react-native";
import Header from "../../components/Common/Header";
import API from "../../services/api";

function getBackendBaseUrl() {
  const baseURL = API.defaults.baseURL || "";
  return baseURL.replace(/\/api\/?$/, "");
}

function getBackendImageUrl(imageUrl) {
  if (!imageUrl) return "";

  if (
    String(imageUrl).startsWith("http://") ||
    String(imageUrl).startsWith("https://") ||
    String(imageUrl).startsWith("data:image/")
  ) {
    return imageUrl;
  }

  return `${getBackendBaseUrl()}${imageUrl}`;
}

function Home({ navigation }) {
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        const res = await API.get("/admin/services");
        setServices(Array.isArray(res.data) ? res.data : []);
      } catch (err) {
        console.log("mobile services error:", err?.response?.data || err.message);
        setMessage("Failed to load services.");
      }
    };

    loadServices();
  }, []);

  const openService = (service) => {
    navigation.navigate("TechniciansByService", {
      service: service.name,
    });
  };

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>Welcome to our services:</Text>
          <Text style={styles.subtitle}>Choose the service you need</Text>

          {message ? <Text style={styles.error}>{message}</Text> : null}

          <View style={styles.grid}>
            {services.map((service) => (
              <TouchableOpacity
                key={service.id}
                style={styles.serviceCard}
                activeOpacity={0.85}
                onPress={() => openService(service)}
              >
                <View style={styles.imageWrap}>
                  {service.image_url ? (
                    <Image
                      source={{ uri: getBackendImageUrl(service.image_url) }}
                      style={styles.image}
                    />
                  ) : (
                    <Text style={styles.icon}>🛠️</Text>
                  )}
                </View>

                <Text style={styles.serviceName}>{service.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E8DCCF",
    flexGrow: 1,
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF9F3",
    borderRadius: 24,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    padding: 20,
    alignItems: "center",
  },
  title: {
    color: "#111",
    fontSize: 30,
    fontWeight: "900",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    color: "#6F6257",
    fontSize: 16,
    marginBottom: 24,
  },
  error: {
    color: "#8A1F1F",
    backgroundColor: "#FCECEC",
    borderWidth: 1,
    borderColor: "#F3B9B9",
    padding: 10,
    borderRadius: 12,
    marginBottom: 15,
  },
  grid: {
    width: "100%",
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  serviceCard: {
    width: "48%",
    alignItems: "center",
    marginBottom: 28,
  },
  imageWrap: {
    width: 135,
    height: 135,
    borderRadius: 68,
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    padding: 10,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 65,
  },
  icon: {
    fontSize: 45,
  },
  serviceName: {
    color: "#111",
    fontSize: 17,
    fontWeight: "900",
    textAlign: "center",
  },
});

export default Home;