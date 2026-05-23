import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../components/Common/Header";
import API from "../../services/api";
import { deleteTechnicianGalleryPost } from "../../services/technicianService";

const screenWidth = Dimensions.get("window").width;
const imageWidth = screenWidth - 30;

function getBackendBaseUrl() {
  const baseURL = API?.defaults?.baseURL || "";
  return String(baseURL).replace(/\/api\/?$/, "");
}

function getImageUrl(imageUrl) {
  if (!imageUrl) return "";

  const value = String(imageUrl).trim();

  if (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("data:image/")
  ) {
    return value;
  }

  const cleanPath = value.startsWith("/") ? value : `/${value}`;
  return `${getBackendBaseUrl()}${cleanPath}`;
}

function normalizeRole(role) {
  return role ? String(role).trim().toLowerCase() : "";
}

function GalleryPostDetails({ route, navigation }) {
  const post = route?.params?.post || null;
  const routeCanEdit = route?.params?.canEdit;
  const readOnly = route?.params?.readOnly || false;
  const technicianId = route?.params?.technicianId || route?.params?.technician_id;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    checkPermission();
  }, [post]);

  const checkPermission = async () => {
    if (readOnly) {
      setCanEdit(false);
      return;
    }

    if (routeCanEdit === true) {
      setCanEdit(true);
      return;
    }

    try {
      const rawUser = await AsyncStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;
      const role = normalizeRole(user?.role);

      const postUserId = post?.user_id || post?.technician_user_id;
      const postTechnicianId =
        post?.technician_id || post?.technicianId || post?.tech_id;

      const ownerByUser = user?.id && postUserId && Number(user.id) === Number(postUserId);
      const ownerByTechnician =
        technicianId && postTechnicianId && Number(technicianId) === Number(postTechnicianId);

      setCanEdit(role === "technician" && (ownerByUser || ownerByTechnician || routeCanEdit));
    } catch {
      setCanEdit(false);
    }
  };

  const images = useMemo(() => {
    if (!post) return [];

    if (Array.isArray(post.images)) {
      return post.images.filter(Boolean);
    }

    if (post.image_url) return [post.image_url];
    if (post.image) return [post.image];

    try {
      const parsed = JSON.parse(post.images || "[]");
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  }, [post]);

  const goToImage = (index) => {
    if (!images.length) return;

    let nextIndex = index;

    if (nextIndex < 0) nextIndex = images.length - 1;
    if (nextIndex >= images.length) nextIndex = 0;

    setSelectedImageIndex(nextIndex);

    scrollRef.current?.scrollTo({
      x: nextIndex * imageWidth,
      animated: true,
    });
  };

  const onScrollEnd = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / imageWidth);

    if (index >= 0 && index < images.length) {
      setSelectedImageIndex(index);
    }
  };

  const handleDelete = () => {
    if (!post?.id || !canEdit) return;

    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTechnicianGalleryPost(post.id);
            navigation.goBack();
          } catch (err) {
            Alert.alert(
              "Error",
              err?.response?.data?.message || "Failed to delete post."
            );
          }
        },
      },
    ]);
  };

  const handleEdit = () => {
    if (!canEdit) return;

    setMenuOpen(false);

    navigation.navigate("TechnicianGalleryManager", {
      editMode: true,
      post,
      postId: post.id,
      technicianId,
      technician_id: technicianId,
    });
  };

  if (!post) {
    return (
      <View style={styles.screen}>
        <Header navigation={navigation} />

        <View style={styles.container}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Post Details</Text>
            <Text style={styles.emptyText}>Post not found.</Text>
          </View>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {canEdit ? (
            <TouchableOpacity
              style={styles.menuButton}
              onPress={() => setMenuOpen((prev) => !prev)}
            >
              <Text style={styles.menuText}>⋮</Text>
            </TouchableOpacity>
          ) : null}

          {menuOpen && canEdit ? (
            <View style={styles.menuBox}>
              <TouchableOpacity style={styles.menuItem} onPress={handleEdit}>
                <Text style={styles.menuItemText}>Edit post</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleDelete}>
                <Text style={[styles.menuItemText, styles.deleteText]}>
                  Delete post
                </Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        <View style={styles.card}>
          <View style={styles.sliderBox}>
            {images.length === 0 ? (
              <View style={styles.noImageBox}>
                <Text style={styles.noImageText}>No images</Text>
              </View>
            ) : (
              <ScrollView
                ref={scrollRef}
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onMomentumScrollEnd={onScrollEnd}
              >
                {images.map((img, index) => (
                  <Image
                    key={`${index}-${img}`}
                    source={{ uri: getImageUrl(img) }}
                    style={styles.mainImage}
                    resizeMode="contain"
                  />
                ))}
              </ScrollView>
            )}

            {images.length > 1 ? (
              <>
                <TouchableOpacity
                  style={[styles.arrow, styles.leftArrow]}
                  onPress={() => goToImage(selectedImageIndex - 1)}
                >
                  <Text style={styles.arrowText}>‹</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.arrow, styles.rightArrow]}
                  onPress={() => goToImage(selectedImageIndex + 1)}
                >
                  <Text style={styles.arrowText}>›</Text>
                </TouchableOpacity>

                <View style={styles.counter}>
                  <Text style={styles.counterText}>
                    {selectedImageIndex + 1} / {images.length}
                  </Text>
                </View>
              </>
            ) : null}
          </View>

          {images.length > 1 ? (
            <ScrollView horizontal style={styles.thumbs}>
              {images.map((img, index) => (
                <TouchableOpacity
                  key={`thumb-${index}`}
                  style={[
                    styles.thumbButton,
                    selectedImageIndex === index && styles.activeThumb,
                  ]}
                  onPress={() => goToImage(index)}
                >
                  <Image
                    source={{ uri: getImageUrl(img) }}
                    style={styles.thumbImage}
                  />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}

          <View style={styles.textBox}>
            <Text style={styles.title}>Work Details</Text>

            <Text style={styles.description}>
              {post.description || post.caption || "No description."}
            </Text>

            {post.location_note || post.location ? (
              <Text style={styles.location}>
                📍 {post.location_note || post.location}
              </Text>
            ) : null}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#E8DCCF",
  },
  container: {
    padding: 15,
    backgroundColor: "#E8DCCF",
    flexGrow: 1,
    paddingBottom: 70,
  },
  topRow: {
    position: "relative",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  backButton: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 16,
  },
  menuButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  menuText: {
    color: "#FFF",
    fontSize: 28,
    fontWeight: "900",
  },
  menuBox: {
    position: "absolute",
    right: 0,
    top: 52,
    backgroundColor: "#FFF9F3",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    overflow: "hidden",
    zIndex: 100,
    elevation: 8,
    minWidth: 160,
  },
  menuItem: {
    paddingVertical: 13,
    paddingHorizontal: 15,
  },
  menuItemText: {
    color: "#111",
    fontWeight: "900",
    fontSize: 15,
  },
  deleteText: {
    color: "#B00020",
  },
  card: {
    backgroundColor: "#FFF9F3",
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  sliderBox: {
    position: "relative",
    backgroundColor: "#111",
  },
  mainImage: {
    width: imageWidth,
    height: 360,
    backgroundColor: "#111",
  },
  noImageBox: {
    width: imageWidth,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    color: "#FFF",
    fontWeight: "900",
  },
  arrow: {
    position: "absolute",
    top: "43%",
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
  },
  leftArrow: {
    left: 12,
  },
  rightArrow: {
    right: 12,
  },
  arrowText: {
    color: "#FFF",
    fontSize: 34,
    lineHeight: 36,
  },
  counter: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.65)",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
  },
  counterText: {
    color: "#FFF",
    fontWeight: "900",
    fontSize: 12,
  },
  thumbs: {
    backgroundColor: "#111",
    padding: 10,
  },
  thumbButton: {
    width: 64,
    height: 64,
    borderRadius: 10,
    overflow: "hidden",
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  activeThumb: {
    borderColor: "#D6B08C",
  },
  thumbImage: {
    width: "100%",
    height: "100%",
  },
  textBox: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 12,
    color: "#111",
  },
  description: {
    color: "#3A3028",
    lineHeight: 24,
    fontSize: 17,
  },
  location: {
    color: "#3A3028",
    marginTop: 14,
    fontSize: 16,
    fontWeight: "700",
  },
  emptyCard: {
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    padding: 18,
    marginTop: 18,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
    marginBottom: 8,
  },
  emptyText: {
    color: "#3A3028",
    fontSize: 16,
  },
});

export default GalleryPostDetails;