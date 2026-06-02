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
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import appStyles from "../../styles/mobileStyles";

function GalleryPostDetails({ route, navigation }) {
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
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Work Details" />

      <View style={appStyles.pageContent}>
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Work Gallery</Text>
          <Text style={appStyles.heroSubtitle}>
            Work post details open as a card.
          </Text>
        </View>
      </View>

      <Modal transparent visible animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <View style={appStyles.between}>
              <Text style={appStyles.modalTitle}>Work Post Details</Text>

              <TouchableOpacity onPress={close}>
                <Text style={{ fontSize: 28, fontWeight: "900" }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {images.length === 0 ? (
                <View style={appStyles.card}>
                  <Text style={appStyles.mutedText}>No images available.</Text>
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
                      backgroundColor: "#FBFAFF",
                    }}
                    resizeMode="contain"
                  />
                ))
              )}

              <View style={appStyles.card}>
                <Text style={appStyles.text}>
                  Description:{" "}
                  {post.description || post.caption || "No description"}
                </Text>

                <Text style={appStyles.text}>
                  Location:{" "}
                  {post.location_note || post.location || "Not provided"}
                </Text>
              </View>

              <TouchableOpacity style={appStyles.primaryBtn} onPress={close}>
                <Text style={appStyles.primaryBtnText}>Close</Text>
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