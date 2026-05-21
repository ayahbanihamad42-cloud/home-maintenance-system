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
import API from "../../services/api";

const API_HOST = "http://localhost:5000";

const getImageUrl = (url) => {
  if (!url) return null;
  if (String(url).startsWith("http")) return url;
  return `${API_HOST}${url}`;
};

export default function TechnicianProfile({ navigation, route }) {
  const params = route?.params || {};
  const initialTech = params.technician || {};
  const technicianId =
    params.technicianId || initialTech.technicianId || initialTech.id;

  const [tech, setTech] = useState(initialTech);
  const [gallery, setGallery] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadProfile = async () => {
    if (!technicianId) return;

    try {
      setLoading(true);
      const res = await API.get(`/technicians/${technicianId}`);
      setTech(res.data || initialTech);
    } catch (err) {
      console.log("profile error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const loadGallery = async () => {
    if (!technicianId) return;

    try {
      const res = await API.get(`/technicians/${technicianId}/gallery`);
      setGallery(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.log("gallery error:", err.response?.data || err.message);
      setGallery([]);
    }
  };

  useEffect(() => {
    loadProfile();
    loadGallery();
  }, [technicianId]);

  if (!technicianId) {
    return (
      <View style={styles.screen}>
        <Header navigation={navigation} />
        <View style={styles.notice}>
          <Text style={styles.noticeTitle}>Notice</Text>
          <Text style={styles.noticeText}>Technician id is missing.</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        {loading ? (
          <ActivityIndicator size="large" color="#111" />
        ) : (
          <>
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
                      technician: tech,
                      service: tech.service,
                      technicianName: tech.name,
                      price_per_hour: tech.price_per_hour,
                    })
                  }
                >
                  <Text style={styles.btnText}>Book Now</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.galleryBox}>
              <Text style={styles.galleryTitle}>Work Gallery</Text>

              {gallery.length === 0 ? (
                <Text style={styles.empty}>No gallery posts yet.</Text>
              ) : (
                gallery.map((post) => {
                  let imgs = [];
                  try {
                    imgs = JSON.parse(post.images || "[]");
                  } catch {
                    imgs = [];
                  }

                  return (
                    <View key={post.id} style={styles.post}>
                      <Text style={styles.postCaption}>
                        {post.description || post.caption || ""}
                      </Text>

                      {post.location_note ? (
                        <Text style={styles.postLocation}>
                          📍 {post.location_note}
                        </Text>
                      ) : null}

                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {imgs.map((img, index) => (
                          <Image
                            key={`${post.id}-${index}`}
                            source={{ uri: getImageUrl(img) }}
                            style={styles.postImg}
                          />
                        ))}
                      </ScrollView>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

function Header({ navigation }) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.header}>
      <TouchableOpacity style={styles.menuBtn} onPress={() => setOpen(!open)}>
        <Text style={styles.menuText}>☰</Text>
      </TouchableOpacity>

      <Text style={styles.headerTitle}>Maintenance System</Text>

      <TouchableOpacity style={styles.bell}>
        <Text style={styles.bellText}>🔔</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.logout}>
        <Text style={styles.logoutText}>Log Out</Text>
      </TouchableOpacity>

      {open && (
        <View style={styles.menu}>
          <TouchableOpacity onPress={() => navigation.navigate("Home")}>
            <Text style={styles.menuItem}>Home</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("MaintenanceHistory")}>
            <Text style={styles.menuItem}>History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("UserProfile")}>
            <Text style={styles.menuItem}>Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("AIChat")}>
            <Text style={styles.menuItem}>AI Assistant</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("ChatList")}>
            <Text style={styles.menuItem}>Chat</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#e7dccc" },
  header: {
    minHeight: 96,
    backgroundColor: "#faf5ef",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#d8c8b8",
    zIndex: 100,
  },
  menuBtn: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  menuText: { fontSize: 34, fontWeight: "900" },
  headerTitle: { flex: 1, fontSize: 26, fontWeight: "900", marginLeft: 12 },
  bell: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  bellText: { fontSize: 26 },
  logout: {
    backgroundColor: "#111",
    paddingHorizontal: 22,
    paddingVertical: 16,
    borderRadius: 28,
  },
  logoutText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  menu: {
    position: "absolute",
    top: 88,
    left: 18,
    width: 230,
    backgroundColor: "#fffaf4",
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d8c8b8",
    elevation: 10,
  },
  menuItem: { fontSize: 18, fontWeight: "800", paddingVertical: 12 },
  container: { padding: 24, paddingBottom: 60 },
  backBtn: {
    backgroundColor: "#111",
    alignSelf: "flex-start",
    paddingHorizontal: 28,
    paddingVertical: 18,
    borderRadius: 28,
    marginBottom: 24,
  },
  backText: { color: "#fff", fontSize: 20, fontWeight: "900" },
  card: {
    backgroundColor: "#fffaf4",
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: "#d8c8b8",
    marginBottom: 24,
  },
  name: { fontSize: 44, fontWeight: "900", marginBottom: 12 },
  service: { fontSize: 28, fontWeight: "900", marginBottom: 18 },
  line: { fontSize: 23, marginTop: 10, color: "#3d342d" },
  bio: { fontSize: 22, marginTop: 28, color: "#3d342d", lineHeight: 32 },
  actions: { flexDirection: "row", gap: 14, marginTop: 28, flexWrap: "wrap" },
  btn: {
    backgroundColor: "#111",
    paddingVertical: 18,
    paddingHorizontal: 28,
    borderRadius: 30,
  },
  btnText: { color: "#fff", fontSize: 18, fontWeight: "900" },
  galleryBox: {
    backgroundColor: "#fffaf4",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  galleryTitle: { fontSize: 32, fontWeight: "900", marginBottom: 18 },
  empty: { fontSize: 20, color: "#6b5e55" },
  post: {
    padding: 16,
    backgroundColor: "#f7efe7",
    borderRadius: 20,
    marginBottom: 18,
  },
  postCaption: { fontSize: 19, fontWeight: "700", marginBottom: 8 },
  postLocation: { fontSize: 17, marginBottom: 12 },
  postImg: {
    width: 170,
    height: 130,
    borderRadius: 16,
    marginRight: 10,
    backgroundColor: "#e7dccc",
  },
  notice: {
    margin: 24,
    backgroundColor: "#fffaf4",
    borderRadius: 28,
    padding: 28,
    borderWidth: 1,
    borderColor: "#d8c8b8",
  },
  noticeTitle: { fontSize: 34, fontWeight: "900" },
  noticeText: { fontSize: 22, marginTop: 14 },
});