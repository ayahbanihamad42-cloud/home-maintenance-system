import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "../../components/Common/Header";
import API from "../../services/api";
import {
  getTechnicianById,
  getTechnicianGallery,
} from "../../services/technicianService";

const getApiHost = () => {
  const base = API?.defaults?.baseURL || "";
  return String(base).replace(/\/api\/?$/, "");
};

const getImageUrl = (url) => {
  if (!url) return null;

  const value = String(url).trim();

  if (!value) return null;
  if (value.startsWith("http://")) return value;
  if (value.startsWith("https://")) return value;
  if (value.startsWith("data:image/")) return value;

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

const normalizeGalleryResponse = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.posts)) return data.posts;
  if (Array.isArray(data?.gallery)) return data.gallery;
  if (Array.isArray(data?.data)) return data.data;
  return [];
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
  const [canEditGallery, setCanEditGallery] = useState(false);

  const loadProfile = async () => {
    if (!technicianId) {
      setMessage({
        title: "Notice",
        body: "Technician id is missing.",
      });
      return;
    }

    try {
      setLoading(true);
      setMessage(null);

      const data = await getTechnicianById(technicianId);
      setTech(data || initialTech || {});
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

    try {
      setGalleryLoading(true);

      const data = await getTechnicianGallery(technicianId);
      setGallery(normalizeGalleryResponse(data));
    } catch (err) {
      console.log("technician gallery error:", err?.response?.data || err.message);
      setGallery([]);
    } finally {
      setGalleryLoading(false);
    }
  };

  const checkGalleryPermission = async (profileData = tech) => {
    try {
      const raw = await AsyncStorage.getItem("user");
      const user = raw ? JSON.parse(raw) : null;

      const role = String(user?.role || "").toLowerCase();

      const profileUserId =
        profileData?.user_id ||
        profileData?.userId ||
        profileData?.technician_user_id ||
        null;

      const profileTechnicianId =
        profileData?.technician_id ||
        profileData?.technicianId ||
        profileData?.tech_id ||
        profileData?.id ||
        technicianId;

      const ownerByUser =
        user?.id && profileUserId && Number(user.id) === Number(profileUserId);

      const ownerByTechnician =
        user?.technician_id &&
        profileTechnicianId &&
        Number(user.technician_id) === Number(profileTechnicianId);

      setCanEditGallery(role === "technician" && (ownerByUser || ownerByTechnician));
    } catch {
      setCanEditGallery(false);
    }
  };

  useEffect(() => {
    const run = async () => {
      await loadProfile();
      await loadGallery();
    };

    run();

    const unsubscribe = navigation.addListener("focus", run);
    return unsubscribe;
  }, [navigation, technicianId]);

  useEffect(() => {
    checkGalleryPermission(tech);
  }, [tech, technicianId]);

  const galleryPosts = useMemo(() => {
    return Array.isArray(gallery) ? gallery : [];
  }, [gallery]);

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

        <View style={styles.card}>
          {loading ? (
            <Text style={styles.empty}>Loading technician...</Text>
          ) : (
            <>
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
            </>
          )}
        </View>

        <View style={styles.galleryBox}>
          <View style={styles.galleryHeader}>
            <Text style={styles.galleryTitle}>Work Gallery</Text>

            {canEditGallery ? (
              <TouchableOpacity
                style={styles.addPostBtn}
                onPress={() =>
                  navigation.navigate("TechnicianGalleryManager", {
                    technicianId,
                    technician_id: technicianId,
                  })
                }
              >
                <Text style={styles.addPostText}>＋</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {galleryLoading ? (
            <Text style={styles.empty}>Loading gallery...</Text>
          ) : galleryPosts.length === 0 ? (
            <Text style={styles.empty}>No gallery posts yet.</Text>
          ) : (
            galleryPosts.map((post) => {
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
                      readOnly: !canEditGallery,
                      canEdit: canEditGallery,
                    })
                  }
                >
                  <View style={styles.postHeader}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.postCaption}>
                        {post.description || post.caption || "No description"}
                      </Text>

                      {post.location_note || post.location ? (
                        <Text style={styles.postLocation}>
                          📍 {post.location_note || post.location}
                        </Text>
                      ) : null}
                    </View>

                    {canEditGallery ? (
                      <TouchableOpacity
                        style={styles.postDots}
                        onPress={() =>
                          navigation.navigate("GalleryPostDetails", {
                            post,
                            technicianId,
                            technician_id: technicianId,
                            tech,
                            canEdit: true,
                            readOnly: false,
                          })
                        }
                      >
                        <Text style={styles.postDotsText}>⋮</Text>
                      </TouchableOpacity>
                    ) : null}
                  </View>

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
  galleryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  galleryTitle: { fontSize: 32, fontWeight: "900", color: "#111" },
  addPostBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  addPostText: {
    color: "#FFF",
    fontSize: 26,
    fontWeight: "900",
  },
  empty: { fontSize: 19, color: "#6B5E55" },
  post: {
    padding: 16,
    backgroundColor: "#F7EFE7",
    borderRadius: 22,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#E2D3C4",
  },
  postHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
    marginBottom: 10,
  },
  postCaption: {
    fontSize: 19,
    fontWeight: "900",
    color: "#111",
    marginBottom: 6,
  },
  postLocation: { fontSize: 17, color: "#3D342D" },
  postDots: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  postDotsText: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "900",
    lineHeight: 26,
  },
  noImageText: { fontSize: 16, color: "#6B5E55", marginTop: 6 },
  postImg: {
    width: 170,
    height: 130,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: "#E7DCCC",
  },
});