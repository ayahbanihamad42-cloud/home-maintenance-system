import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
  Modal,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

function TechnicianProfile({ route, navigation }) {
  const params = route?.params || {};
  const [user, setUser] = useState({});
  const [tech, setTech] = useState(null);
  const [gallery, setGallery] = useState([]);
  const [message, setMessage] = useState("");
  const [viewPost, setViewPost] = useState(null);

  const technicianId =
    params.technicianId ||
    params.technician_id ||
    params.id ||
    params.tech?.id ||
    params.tech?.technician_id ||
    "";

  const baseUrl = String(API.defaults.baseURL || "").replace(/\/api\/?$/, "");

  const getImageUrl = (url) => {
    if (!url) return "";
    if (String(url).startsWith("http")) return url;
    if (String(url).startsWith("data:image")) return url;
    return `${baseUrl}${url}`;
  };

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

  const fixedGallery = useMemo(() => {
    return gallery.map((post) => ({
      ...post,
      fixedImages: normalizeImages(post).map(getImageUrl),
    }));
  }, [gallery]);

  const loadUser = async () => {
    const raw = await AsyncStorage.getItem("user");
    setUser(raw ? JSON.parse(raw) : {});
  };

  const loadTech = async () => {
    try {
      setMessage("");

      if (!technicianId) {
        setMessage("Technician id is missing.");
        return;
      }

      const res = await API.get(`/technicians/${technicianId}`);
      setTech(res.data || null);
    } catch {
      setMessage("Failed to load technician profile.");
    }
  };

  const loadGallery = async () => {
    try {
      if (!technicianId) return;

      const res = await API.get(`/technicians/${technicianId}/gallery`);
      const data = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.posts)
        ? res.data.posts
        : [];

      setGallery(data);
    } catch {
      setGallery([]);
    }
  };

  useEffect(() => {
    loadUser();
    loadTech();
    loadGallery();
  }, [technicianId]);

  const openChat = () => {
    const receiverId =
      tech?.user_id ||
      tech?.userId ||
      tech?.technician_user_id ||
      tech?.technicianUserId;

    if (!receiverId) {
      setMessage("Could not open chat. Technician user id is missing.");
      return;
    }

    global.openMobileChatWith?.({
      id: receiverId,
      name: tech?.name || "Technician",
    });
  };

  const openBooking = () => {
    navigation.navigate("MaintenanceRequest", {
      technicianId: tech?.technician_id || tech?.technicianId || tech?.id || technicianId,
      technicianName: tech?.name,
      service: tech?.service || tech?.service_name,
      price_per_hour: tech?.price_per_hour,
    });
  };

  if (!tech) {
    return (
      <SafeAreaView style={appStyles.safe}>
        <Header navigation={navigation} title="Technician" />
        <ScrollView contentContainerStyle={appStyles.pageContent}>
          <HeroSection
            title="Technician Profile"
            subtitle="View technician details and work gallery."
          />
          <View style={appStyles.card}>
            <Text style={appStyles.text}>{message || "Loading..."}</Text>
          </View>
        </ScrollView>
        <FloatingActions navigation={navigation} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Technician" />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <HeroSection
          title={tech.name || "Technician"}
          subtitle={`${tech.service || tech.service_name || "-"} Specialist`}
        />

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

          <TouchableOpacity style={appStyles.primaryBtn} onPress={openChat}>
            <Text style={appStyles.primaryBtnText}>Send Message</Text>
          </TouchableOpacity>

          <TouchableOpacity style={appStyles.secondaryBtn} onPress={openBooking}>
            <Text style={appStyles.secondaryBtnText}>Book Now</Text>
          </TouchableOpacity>
        </View>

        <Text style={appStyles.sectionTitle}>Work Gallery</Text>

        {fixedGallery.length === 0 ? (
          <View style={appStyles.card}>
            <Text style={appStyles.mutedText}>No gallery posts yet.</Text>
          </View>
        ) : (
          fixedGallery.map((post, index) => {
            const image = post.fixedImages?.[0];

            return (
              <TouchableOpacity
                key={post.id || index}
                style={appStyles.card}
                activeOpacity={0.9}
                onPress={() => setViewPost(post)}
              >
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{
                      width: "100%",
                      height: 250,
                      borderRadius: 22,
                      marginBottom: 14,
                    }}
                    resizeMode="cover"
                  />
                ) : null}

                <Text style={appStyles.text}>
                  {post.description || post.caption || "No description"}
                </Text>

                <Text style={appStyles.mutedText}>
                  Location: {post.location_note || post.location || "Not provided"}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal transparent visible={!!viewPost} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <View style={appStyles.between}>
              <Text style={appStyles.modalTitle}>Post Details</Text>
              <TouchableOpacity onPress={() => setViewPost(null)}>
                <Text style={{ fontSize: 28, fontWeight: "900" }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView>
              {(viewPost?.fixedImages || []).map((img, index) => (
                <Image
                  key={`${img}-${index}`}
                  source={{ uri: img }}
                  style={{
                    width: "100%",
                    height: 260,
                    borderRadius: 22,
                    marginBottom: 14,
                  }}
                  resizeMode="cover"
                />
              ))}

              <Text style={appStyles.text}>
                {viewPost?.description || viewPost?.caption || "No description"}
              </Text>
              <Text style={appStyles.mutedText}>
                Location: {viewPost?.location_note || viewPost?.location || "Not provided"}
              </Text>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default TechnicianProfile;