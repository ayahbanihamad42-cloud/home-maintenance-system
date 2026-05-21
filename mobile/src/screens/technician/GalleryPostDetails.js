import React, { useMemo, useRef, useState } from "react";
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
import Header from "../../components/Common/Header";
import { deleteTechnicianGalleryPost } from "../../services/technicianService";

const screenWidth = Dimensions.get("window").width;
const imageWidth = screenWidth - 30;

function GalleryPostDetails({ route, navigation }) {
  const post = route?.params?.post || null;

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const scrollRef = useRef(null);

  const images = useMemo(() => {
    if (!post?.images) return [];

    if (Array.isArray(post.images)) {
      return post.images.filter(Boolean);
    }

    try {
      const parsed = JSON.parse(post.images);
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
    if (!post?.id) return;

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
    setMenuOpen(false);

    navigation.navigate("TechnicianDashboard", {
      openGalleryEdit: true,
      post,
    });
  };

  if (!post) {
    return (
      <>
        <Header />

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
      </>
    );
  }

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setMenuOpen((prev) => !prev)}
          >
            <Text style={styles.menuText}>⋮</Text>
          </TouchableOpacity>

          {menuOpen ? (
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
                    source={{ uri: img }}
                    style={styles.mainImage}
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
                  <Image source={{ uri: img }} style={styles.thumbImage} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          ) : null}

          <View style={styles.textBox}>
            <Text style={styles.title}>Work Details</Text>
            <Text style={styles.description}>
              {post.description || "No description."}
            </Text>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: "#E8DCCF",
    flexGrow: 1,
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
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
  },
  backText: {
    color: "#FFF",
    fontWeight: "800",
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
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
    top: 50,
    backgroundColor: "#FFF9F3",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    overflow: "hidden",
    zIndex: 100,
    elevation: 8,
    minWidth: 150,
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
  },
  menuItemText: {
    color: "#111",
    fontWeight: "800",
  },
  deleteText: {
    color: "#B00020",
  },
  card: {
    backgroundColor: "#FFF9F3",
    borderRadius: 20,
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
    resizeMode: "contain",
  },
  noImageBox: {
    width: imageWidth,
    height: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  noImageText: {
    color: "#FFF",
    fontWeight: "800",
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
    fontWeight: "700",
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
    padding: 18,
  },
  title: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 10,
    color: "#111",
  },
  description: {
    color: "#3A3028",
    lineHeight: 22,
  },
  emptyCard: {
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    padding: 18,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111",
    marginBottom: 8,
  },
  emptyText: {
    color: "#3A3028",
  },
});

export default GalleryPostDetails;