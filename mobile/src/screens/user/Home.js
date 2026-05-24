import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import Header from "../../components/Common/Header";
import API from "../../services/api";

const API_ORIGIN = API.defaults.baseURL.replace("/api", "");

const getImageUrl = (imageUrl, serviceName) => {
  const fallbackMap = {
    plumbing: "/images/services/plumbing.png",
    electrical: "/images/services/Electrical.png",
    painting: "/images/services/Painting.png",
    decoration: "/images/services/Decoration.png",
  };

  const cleanName = String(serviceName || "").trim().toLowerCase();
  const finalPath = imageUrl || fallbackMap[cleanName];

  if (!finalPath) return null;

  if (
    String(finalPath).startsWith("http://") ||
    String(finalPath).startsWith("https://") ||
    String(finalPath).startsWith("data:image")
  ) {
    return finalPath;
  }

  const path = String(finalPath).startsWith("/") ? finalPath : `/${finalPath}`;
  return `${API_ORIGIN}${path}`;
};

export default function Home({ navigation }) {
  const [services, setServices] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadServices = async () => {
    try {
      setRefreshing(true);
      setError("");

      const res = await API.get("/services");
      setServices(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("mobile home services error:", err?.response?.data || err.message);
      setServices([]);
      setError(err?.response?.data?.message || "Failed to load services.");
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadServices();
    const unsubscribe = navigation.addListener("focus", loadServices);
    return unsubscribe;
  }, [navigation]);

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.panel}>
          <Text style={styles.title}>Welcome to our services:</Text>
          <Text style={styles.subtitle}>Choose the service you need</Text>

          {error ? (
            <View style={styles.messageBox}>
              <Text style={styles.errorTitle}>Error</Text>
              <Text style={styles.errorText}>{error}</Text>

              <TouchableOpacity style={styles.retryBtn} onPress={loadServices}>
                <Text style={styles.retryText}>Try Again</Text>
              </TouchableOpacity>
            </View>
          ) : services.length === 0 ? (
            <View style={styles.messageBox}>
              <Text style={styles.emptyText}>
                {refreshing ? "Loading services..." : "No services available."}
              </Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {services.map((service) => {
                const imageUri = getImageUrl(service.image_url, service.name);

                return (
                  <TouchableOpacity
                    key={service.id || service.name}
                    style={styles.serviceItem}
                    onPress={() =>
                      navigation.navigate("TechniciansByService", {
                        service: service.name,
                      })
                    }
                  >
                    <View style={styles.circle}>
                      {imageUri ? (
                        <Image
                          source={{ uri: imageUri }}
                          style={styles.image}
                          resizeMode="contain"
                        />
                      ) : (
                        <Text style={styles.icon}>🛠️</Text>
                      )}
                    </View>

                    <Text style={styles.serviceName}>{service.name}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E8DCCF" },
  container: { padding: 22, paddingBottom: 90 },
  panel: {
    backgroundColor: "#FFF9F3",
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#111",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: "#6B5E55",
    textAlign: "center",
    fontWeight: "700",
    marginBottom: 24,
  },
  messageBox: {
    backgroundColor: "#F7EFE7",
    borderRadius: 22,
    padding: 18,
    alignItems: "center",
  },
  errorTitle: {
    color: "#B4232B",
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 6,
  },
  errorText: {
    color: "#B4232B",
    fontWeight: "700",
    fontSize: 15,
    textAlign: "center",
  },
  retryBtn: {
    backgroundColor: "#111",
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 22,
    marginTop: 14,
  },
  retryText: { color: "#FFF", fontWeight: "900", fontSize: 16 },
  emptyText: { fontSize: 18, fontWeight: "800", color: "#5C5048" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: 28,
  },
  serviceItem: {
    width: "47%",
    alignItems: "center",
  },
  circle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  image: { width: 105, height: 105 },
  icon: { fontSize: 42 },
  serviceName: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111",
    textAlign: "center",
  },
});