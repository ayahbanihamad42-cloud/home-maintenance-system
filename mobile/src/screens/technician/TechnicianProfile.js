import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ActivityIndicator,
} from "react-native";

import Header from "../../components/Common/Header";
import API from "../../services/api";

const apiGetWithTimeout = (url, config = {}, ms = 8000) =>
  Promise.race([
    API.get(url, config),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Request timeout")), ms)
    ),
  ]);

const getApiHost = () => {
  const base = API?.defaults?.baseURL || "";
  return String(base).replace(/\/api\/?$/, "");
};

const getImageUrl = (url) => {
  if (!url) return null;
  const value = String(url).trim();
  if (!value) return null;
  if (value.startsWith("http")) return value;
  return `${getApiHost()}${value.startsWith("/") ? value : `/${value}`}`;
};

const getTechnicianId = (obj = {}) =>
  obj.technicianId ||
  obj.technician_id ||
  obj.technicianID ||
  obj.tech_id ||
  obj.id ||
  null;

const normalizeImages = (post = {}) => {
  if (Array.isArray(post.images)) return post.images.filter(Boolean);
  if (post.image_url) return [post.image_url];
  if (post.image) return [post.image];

  try {
    const parsed = JSON.parse(post.images || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

export default function TechnicianProfile({ navigation, route }) {
  const params = route?.params || {};
  const initialTech = params.tech || params.technician || {};

  const technicianId =
    params.technicianId ||
    params.technician_id ||
    getTechnicianId(initialTech);

  const [tech, setTech] = useState(initialTech || {});
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const loadProfile = async () => {
    if (!technicianId) {
      setMessage({
        title: "Notice",
        body: "Technician id is missing.",
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await apiGetWithTimeout(`/technicians/${technicianId}`);
      setTech(res.data || initialTech || {});
    } catch (err) {
      console.log("technician profile error:", err?.response?.data || err.message);
      setTech(initialTech || {});
      setMessage({
        title: "Notice",
        body: "Could not refresh technician data.",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadGallery = async () => {
    if (!technicianId) {
      setGallery([]);
      return;
    }

    setGalleryLoading(true);

    try {
      const res = await apiGetWithTimeout(`/technicians/${technicianId}/gallery`);

      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.posts)
        ? res.data.posts
        : Array.isArray(res.data?.gallery)
        ? res.data.gallery
        : [];

      setGallery(data);
    } catch (err) {
      console.log("technician gallery error:", err?.response?.data || err.message);
      setGallery([]);
    } finally {
      setGalleryLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadProfile();
      loadGallery();
    });

    return unsubscribe;
  }, [navigation, technicianId]);

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {message ? (
          <View style={styles.messageBox}>
            <Text style={styles.messageTitle}>{message.title}</Text>
            <Text style={styles.messageBody}>{message.body}</Text>
          </View>
        ) : null}

        {loading ? (
          <ActivityIndicator size="large" color="#111" style={{ marginTop: 35 }} />
        ) : (
          <View style={styles.card}>
            <Text style={styles.name}>{tech.name || "Technician"}</Text>
            <Text style={styles.service}>{tech.service || "-"}</Text>

            <Text style={styles.line}>City: {tech.city || "-"}</Text>
            <Text style={styles.line}>Phone: {tech.phone || "-"}</Text>
            <Text style={styles.line}>
              Experience: {tech.experience || 0} years
            </Text>
            <Text style={styles.line}>
              Price: {Number(tech.price_per_hour || 0).toFixed(2)} JOD/hour
            </Text>
            <Text style={styles.line}>
              Rating: ⭐ {tech.rating || tech.average_rating || "0.0"}
            </Text>

            <Text style={styles.bio}>
              {tech.bio || "Experienced technician ready to help."}
            </Text>

            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.btn}
                onPress={() =>
                  navigation.navigate("Chat", {
                    userId: tech.user_id,
                    receiverId: tech.user_id,
                    name: tech.name,
                    user: {
                      id: tech.user_id,
                      name: tech.name,
                    },
                  })
                }
              >
                <Text style={styles.btnText}>Send Message</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.btn}
                onPress={() =>
                  navigation.navigate("MaintenanceRequest", {
                    technicianId,
                    technician_id: technicianId,
                    technician: tech,
                    tech,
                    service: tech.service,
                    technicianName: tech.name,
                    price_per_hour: tech.price_per_hour,
                  })
                }
              >
                <Text style={styles.btnText}>Book Now</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.softDivider} />
          </View>
        )}

        <View style={styles.galleryBox}>
          <Text style={styles.galleryTitle}>Work Gallery</Text>

          {galleryLoading ? (
            <ActivityIndicator color="#111" style={{ marginTop: 22 }} />
          ) : gallery.length === 0 ? (
            <Text style={styles.empty}>No gallery posts yet.</Text>
          ) : (
            gallery.map((post) => {
              const images = normalizeImages(post);

              return (
                <TouchableOpacity
                  key={post.id}
                  style={styles.post}
                  onPress={() =>
                    navigation.navigate("GalleryPostDetails", {
                      post,
                      technicianId,
                      technician_id: technicianId,
                      tech,
                    })
                  }
                >
                  <Text style={styles.postCaption}>
                    {post.description || post.caption || "No description"}
                  </Text>

                  {post.location_note || post.location ? (
                    <Text style={styles.postLocation}>
                      📍 {post.location_note || post.location}
                    </Text>
                  ) : null}

                  {images.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {images.map((img, index) => (
                        <Image
                          key={`${post.id}-${index}`}
                          source={{ uri: getImageUrl(img) }}
                          style={styles.postImg}
                        />
                      ))}
                    </ScrollView>
                  ) : (
                    <Text style={styles.noImageText}>No images attached.</Text>
                  )}
                </TouchableOpacity>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E7DCCC" },
  container: { padding: 24, paddingBottom: 70 },
  backBtn: {
    backgroundColor: "#111",
    alignSelf: "flex-start",
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 999,
    marginBottom: 20,
  },
  backText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  messageBox: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 24,
    padding: 20,
    marginBottom: 18,
  },
  messageTitle: { fontSize: 24, fontWeight: "900", color: "#111" },
  messageBody: { fontSize: 18, color: "#3D342D", marginTop: 8 },
  card: {
    backgroundColor: "#FFF9F3",
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    marginBottom: 24,
  },
  name: { fontSize: 44, fontWeight: "900", marginBottom: 12, color: "#111" },
  service: { fontSize: 28, fontWeight: "900", marginBottom: 18, color: "#111" },
  line: { fontSize: 22, marginTop: 10, color: "#3D342D" },
  bio: { fontSize: 21, marginTop: 28, color: "#3D342D", lineHeight: 32 },
  actions: { flexDirection: "row", gap: 14, marginTop: 28, flexWrap: "wrap" },
  softDivider: {
    height: 1,
    backgroundColor: "#111",
    opacity: 0.24,
    marginTop: 26,
  },
  btn: {
    backgroundColor: "#111",
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  galleryBox: {
    backgroundColor: "#FFF9F3",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    marginTop: 4,
  },
  galleryTitle: { fontSize: 32, fontWeight: "900", marginBottom: 18, color: "#111" },
  empty: { fontSize: 19, color: "#6B5E55" },
  post: {
    padding: 16,
    backgroundColor: "#F7EFE7",
    borderRadius: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E2D3C4",
  },
  postCaption: { fontSize: 19, fontWeight: "800", marginBottom: 8, color: "#111" },
  postLocation: { fontSize: 17, marginBottom: 12, color: "#3D342D" },
  noImageText: { fontSize: 16, color: "#6B5E55", marginTop: 6 },
  postImg: {
    width: 170,
    height: 130,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: "#E7DCCC",
  },
});