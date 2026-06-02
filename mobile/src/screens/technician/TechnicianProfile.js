import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
} from "react-native";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import API from "../../services/api";
import { getTechnicianGallery } from "../../services/technicianService";
import appStyles from "../../styles/mobileStyles";

function TechnicianProfile({ route, navigation }) {
  const technicianId =
    route?.params?.technicianId ||
    route?.params?.technician_id ||
    route?.params?.id;

  const [tech, setTech] = useState(null);
  const [galleryPosts, setGalleryPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);
  const [message, setMessage] = useState("");

  const loadTech = async () => {
    try {
      const res = await API.get(`/technicians/${technicianId}`);
      setTech(res.data || null);
    } catch {
      setMessage("Failed to load technician profile.");
    }
  };

  const loadGallery = async () => {
    try {
      const posts = await getTechnicianGallery(technicianId);
      setGalleryPosts(Array.isArray(posts) ? posts : []);
    } catch {
      setGalleryPosts([]);
    }
  };

  useEffect(() => {
    if (!technicianId) return;
    loadTech();
    loadGallery();
  }, [technicianId]);

  const normalizeImages = (post) => {
    if (!post) return [];

    if (Array.isArray(post.images)) return post.images.filter(Boolean);

    if (typeof post.images === "string") {
      try {
        const parsed = JSON.parse(post.images);
        if (Array.isArray(parsed)) return parsed.filter(Boolean);
      } catch {
        return post.images
          .split(",")
          .map((img) => img.trim())
          .filter(Boolean);
      }
    }

    if (post.image_url) return [post.image_url];
    if (post.image) return [post.image];

    return [];
  };

  const fixedPosts = useMemo(() => {
    return galleryPosts.map((post) => ({
      ...post,
      images: normalizeImages(post),
    }));
  }, [galleryPosts]);

  if (!tech) {
    return (
      <SafeAreaView style={appStyles.safe}>
        <Header navigation={navigation} title="Profile" />
        <View style={appStyles.pageContent}>
          <View style={appStyles.card}>
            <Text style={appStyles.text}>
              {message || "Loading technician profile..."}
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Technician" />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>{tech.name || "Technician"}</Text>
          <Text style={appStyles.heroSubtitle}>
            {tech.service || "-"} Specialist
          </Text>
        </View>

        {message ? (
          <View style={appStyles.errorBox}>
            <Text style={appStyles.errorText}>{message}</Text>
          </View>
        ) : null}

        <View style={appStyles.card}>
          <Text style={appStyles.sectionTitle}>Profile Information</Text>

          <Text style={appStyles.text}>
            Experience: {tech.experience || 0} Years
          </Text>
          <Text style={appStyles.text}>
            Rating: ⭐ {Number(tech.rating || 0).toFixed(1)}
          </Text>
          <Text style={appStyles.text}>
            Price / hour: {Number(tech.price_per_hour || 0).toFixed(2)} JOD
          </Text>
          <Text style={appStyles.text}>City: {tech.city || "-"}</Text>
          <Text style={appStyles.text}>Phone: {tech.phone || "-"}</Text>
          <Text style={appStyles.text}>Email: {tech.email || "-"}</Text>

          <Text style={[appStyles.mutedText, { marginTop: 12 }]}>
            {tech.bio || "Experienced technician ready to help."}
          </Text>

          <TouchableOpacity
            style={appStyles.primaryBtn}
            onPress={() =>
              navigation.navigate("Chat", {
                receiverId: tech.user_id,
                receiverName: tech.name,
              })
            }
          >
            <Text style={appStyles.primaryBtnText}>Send Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={appStyles.secondaryBtn}
            onPress={() =>
              navigation.navigate("MaintenanceRequest", {
                technicianId: tech.technicianId || tech.id,
                technicianName: tech.name,
                service: tech.service,
                price_per_hour: tech.price_per_hour,
              })
            }
          >
            <Text style={appStyles.secondaryBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>

        <Text style={appStyles.sectionTitle}>Work Gallery</Text>

        {fixedPosts.length === 0 ? (
          <View style={appStyles.card}>
            <Text style={appStyles.mutedText}>No work posts yet.</Text>
          </View>
        ) : (
          fixedPosts.map((post) => {
            const firstImage = post.images?.[0];

            return (
              <TouchableOpacity
                key={post.id}
                style={appStyles.card}
                onPress={() => setSelectedPost(post)}
              >
                {firstImage ? (
                  <Image
                    source={{ uri: firstImage }}
                    style={{
                      width: "100%",
                      height: 210,
                      borderRadius: 22,
                      marginBottom: 12,
                    }}
                    resizeMode="cover"
                  />
                ) : null}

                <Text style={appStyles.text}>
                  {post.description || post.caption || "No description"}
                </Text>

                {(post.location_note || post.location) && (
                  <Text style={appStyles.mutedText}>
                    Location: {post.location_note || post.location}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal transparent visible={!!selectedPost} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <View style={appStyles.between}>
              <Text style={appStyles.modalTitle}>Work Post Details</Text>

              <TouchableOpacity onPress={() => setSelectedPost(null)}>
                <Text style={{ fontSize: 26, fontWeight: "900" }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {(selectedPost?.images || []).map((img, index) => (
                <Image
                  key={`${img}-${index}`}
                  source={{ uri: img }}
                  style={{
                    width: "100%",
                    height: 260,
                    borderRadius: 22,
                    marginBottom: 14,
                  }}
                  resizeMode="contain"
                />
              ))}

              <View style={appStyles.card}>
                <Text style={appStyles.text}>
                  Description:{" "}
                  {selectedPost?.description ||
                    selectedPost?.caption ||
                    "No description"}
                </Text>

                <Text style={appStyles.text}>
                  Location:{" "}
                  {selectedPost?.location_note ||
                    selectedPost?.location ||
                    "Not provided"}
                </Text>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default TechnicianProfile;