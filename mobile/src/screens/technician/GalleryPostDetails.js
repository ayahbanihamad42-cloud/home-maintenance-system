import React, { useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
} from "react-native";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import appStyles from "../../styles/mobileStyles";

function GalleryPostDetails({ route, navigation }) {
  const { t } = useTranslation();
  const { c } = useTheme();
  const post = route?.params?.post || {};

  const images = useMemo(() => {
    if (Array.isArray(post.images)) {
      return post.images.filter(Boolean);
    }

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
  }, [post]);

  const close = () => {
    navigation.goBack();
  };

  return (
    <SafeAreaView style={[appStyles.safe, { backgroundColor: c.bg }]}>
      <Header navigation={navigation} title={t("galleryPost.title")} />

      <View style={appStyles.pageContent}>
        <View style={appStyles.hero}>
          <Text style={[appStyles.heroTitle, { color: c.text }]}>{t("galleryPost.heroTitle")}</Text>
          <Text style={[appStyles.heroSubtitle, { color: c.muted }]}>
            {t("galleryPost.heroSubtitle")}
          </Text>
        </View>
      </View>

      <Modal transparent visible animationType="fade">
        <View style={[appStyles.modalOverlay, { backgroundColor: c.overlay }]}>
          <View style={[appStyles.modalBox, { backgroundColor: c.card }]}>
            <View style={appStyles.between}>
              <Text style={[appStyles.modalTitle, { color: c.text }]}>{t("galleryPost.modalTitle")}</Text>

              <TouchableOpacity onPress={close}>
                <Text style={{ fontSize: 28, fontWeight: "900", color: c.text }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {images.length === 0 ? (
                <View style={[appStyles.card, { backgroundColor: c.card }]}>
                  <Text style={[appStyles.mutedText, { color: c.muted }]}>{t("galleryPost.noImages")}</Text>
                </View>
              ) : (
                images.map((img, index) => (
                  <Image
                    key={`${img}-${index}`}
                    source={{ uri: img }}
                    style={{
                      width: "100%",
                      height: 260,
                      borderRadius: 22,
                      marginBottom: 14,
                      backgroundColor: c.bg,
                    }}
                    resizeMode="contain"
                  />
                ))
              )}

              <View style={[appStyles.card, { backgroundColor: c.card }]}>
                <Text style={[appStyles.text, { color: c.text }]}>
                  {t("galleryPost.description")}{" "}
                  {post.description || post.caption || t("galleryPost.noDescription")}
                </Text>

                <Text style={[appStyles.text, { color: c.text }]}>
                  {t("galleryPost.location")}{" "}
                  {post.location_note || post.location || t("galleryPost.notProvided")}
                </Text>
              </View>

              <TouchableOpacity style={appStyles.primaryBtn} onPress={close}>
                <Text style={appStyles.primaryBtnText}>{t("galleryPost.close")}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default GalleryPostDetails;