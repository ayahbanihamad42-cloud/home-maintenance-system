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

import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

function TechnicianProfile({ route, navigation }) {
  const { t } = useTranslation();
  const { c } = useTheme();
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
      <SafeAreaView style={[appStyles.safe, { backgroundColor: c.bg }]}>
        <Header navigation={navigation} title={t("techProfile.headerTitle")} />
        <ScrollView contentContainerStyle={appStyles.pageContent}>
          <HeroSection
            title={t("techProfile.title")}
            subtitle={t("techProfile.subtitle")}
          />
          <View style={[appStyles.card, { backgroundColor: c.card }]}>
            <Text style={[appStyles.text, { color: c.text }]}>{message || t("techProfile.loading")}</Text>
          </View>
        </ScrollView>
        <FloatingActions navigation={navigation} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[appStyles.safe, { backgroundColor: c.bg }]}>
      <Header navigation={navigation} title={t("techProfile.headerTitle")} />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <HeroSection
          title={tech.name || t("techProfile.headerTitle")}
          subtitle={`${tech.service || tech.service_name || "-"} ${t("techProfile.specialist")}`}
        />

        {message ? (
          <View style={appStyles.errorBox}>
            <Text style={appStyles.errorText}>{message}</Text>
          </View>
        ) : null}

        <View style={[appStyles.card, { backgroundColor: c.card }]}>
          <Text style={[appStyles.sectionTitle, { color: c.text }]}>{t("techProfile.profileInfo")}</Text>

          <Text style={[appStyles.text, { color: c.text }]}>
            {t("techProfile.experience")} {tech.experience || 0} {t("techProfile.years")}
          </Text>
          <Text style={[appStyles.text, { color: c.text }]}>
            {t("techProfile.rating")} ⭐ {Number(tech.rating || 0).toFixed(1)}
          </Text>
          <Text style={[appStyles.text, { color: c.text }]}>
            {t("techProfile.pricePerHour")} {Number(tech.price_per_hour || 0).toFixed(2)} JOD
          </Text>
          <Text style={[appStyles.text, { color: c.text }]}>{t("techProfile.city")} {tech.city || "-"}</Text>
          <Text style={[appStyles.text, { color: c.text }]}>{t("techProfile.phone")} {tech.phone || "-"}</Text>
          <Text style={[appStyles.text, { color: c.text }]}>{t("techProfile.email")} {tech.email || "-"}</Text>

          <Text style={[appStyles.mutedText, { marginTop: 12, color: c.muted }]}>
            {tech.bio || t("techProfile.defaultBio")}
          </Text>

          <TouchableOpacity style={appStyles.primaryBtn} onPress={openChat}>
            <Text style={appStyles.primaryBtnText}>{t("techProfile.sendMessage")}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={appStyles.secondaryBtn} onPress={openBooking}>
            <Text style={appStyles.secondaryBtnText}>{t("techProfile.bookNow")}</Text>
          </TouchableOpacity>
        </View>

        <Text style={[appStyles.sectionTitle, { color: c.text }]}>{t("techProfile.workGallery")}</Text>

        {fixedGallery.length === 0 ? (
          <View style={[appStyles.card, { backgroundColor: c.card }]}>
            <Text style={[appStyles.mutedText, { color: c.muted }]}>{t("techProfile.noGalleryPosts")}</Text>
          </View>
        ) : (
          fixedGallery.map((post, index) => {
            const image = post.fixedImages?.[0];

            return (
              <TouchableOpacity
                key={post.id || index}
                style={[appStyles.card, { backgroundColor: c.card }]}
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

                <Text style={[appStyles.text, { color: c.text }]}>
                  {post.description || post.caption || t("techProfile.noDescription")}
                </Text>

                <Text style={[appStyles.mutedText, { color: c.muted }]}>
                  {t("techProfile.locationLabel")} {post.location_note || post.location || t("techProfile.notProvided")}
                </Text>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      <Modal transparent visible={!!viewPost} animationType="fade">
        <View style={[appStyles.modalOverlay, { backgroundColor: c.overlay }]}>
          <View style={[appStyles.modalBox, { backgroundColor: c.card }]}>
            <View style={appStyles.between}>
              <Text style={[appStyles.modalTitle, { color: c.text }]}>{t("techProfile.postDetails")}</Text>
              <TouchableOpacity onPress={() => setViewPost(null)}>
                <Text style={{ fontSize: 28, fontWeight: "900", color: c.text }}>✕</Text>
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

              <Text style={[appStyles.text, { color: c.text }]}>
                {viewPost?.description || viewPost?.caption || t("techProfile.noDescription")}
              </Text>
              <Text style={[appStyles.mutedText, { color: c.muted }]}>
                {t("techProfile.locationLabel")} {viewPost?.location_note || viewPost?.location || t("techProfile.notProvided")}
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