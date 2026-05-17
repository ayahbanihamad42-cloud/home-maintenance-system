import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useNavigation } from "@react-navigation/native";
import {
  createTechnicianGalleryPost,
  getMyTechnicianGallery,
} from "../../services/technicianService";

function TechnicianGalleryManager() {
  const navigation = useNavigation();

  const [posts, setPosts] = useState([]);
  const [showCreate, setShowCreate] = useState(false);
  const [description, setDescription] = useState("");
  const [locationText, setLocationText] = useState("");
  const [images, setImages] = useState([]);

  const loadPosts = async () => {
    try {
      const data = await getMyTechnicianGallery();
      setPosts(data || []);
    } catch {
      setPosts([]);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 6,
      quality: 0.7,
      base64: true,
    });

    if (result.canceled) return;

    const selected = (result.assets || [])
      .slice(0, 6)
      .map((asset) => {
        const mimeType = asset.mimeType || "image/jpeg";
        return `data:${mimeType};base64,${asset.base64}`;
      })
      .filter((img) => img.startsWith("data:image/"));

    setImages(selected);
  };

  const submitPost = async () => {
    if (images.length === 0) {
      Alert.alert("Notice", "Choose at least one image.");
      return;
    }

    if (!description.trim()) {
      Alert.alert("Notice", "Write a caption first.");
      return;
    }

    const finalDescription = locationText.trim()
      ? `${description.trim()}\n\nLocation: ${locationText.trim()}`
      : description.trim();

    try {
      await createTechnicianGalleryPost({
        description: finalDescription,
        images,
      });

      setImages([]);
      setDescription("");
      setLocationText("");
      setShowCreate(false);
      loadPosts();
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || "Failed to add post.");
    }
  };

  const openPost = (post) => {
    navigation.navigate("GalleryPostDetails", { post });
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.divider}>
        <View style={styles.line} />

        <TouchableOpacity
          style={styles.plusButton}
          onPress={() => setShowCreate(true)}
        >
          <Text style={styles.plusText}>+</Text>
        </TouchableOpacity>

        <View style={styles.line} />
      </View>

      <Text style={styles.title}>Work Gallery</Text>

      {showCreate ? (
        <View style={styles.createCard}>
          <Text style={styles.createTitle}>Create New Work Post</Text>

          <TouchableOpacity style={styles.pickButton} onPress={pickImages}>
            <Text style={styles.pickText}>Choose Images</Text>
          </TouchableOpacity>

          {images.length > 0 ? (
            <ScrollView horizontal style={styles.previewRow}>
              {images.map((img, index) => (
                <Image key={index} source={{ uri: img }} style={styles.preview} />
              ))}
            </ScrollView>
          ) : null}

          <TextInput
            style={styles.textarea}
            multiline
            placeholder="Write caption / work details..."
            value={description}
            onChangeText={setDescription}
          />

          <TextInput
            style={styles.input}
            placeholder="Location / office / work place"
            value={locationText}
            onChangeText={setLocationText}
          />

          <View style={styles.actions}>
            <TouchableOpacity style={styles.actionButton} onPress={submitPost}>
              <Text style={styles.actionText}>Post</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreate(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}

      {posts.length === 0 ? (
        <Text style={styles.empty}>No posts yet.</Text>
      ) : (
        <View style={styles.grid}>
          {posts.map((post) => (
            <TouchableOpacity
              key={post.id}
              style={styles.post}
              onPress={() => openPost(post)}
            >
              <Image source={{ uri: post.images?.[0] }} style={styles.postImage} />

              <Text style={styles.caption} numberOfLines={2}>
                {post.description}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    marginTop: 28,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#D8C8B8",
  },
  plusButton: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: {
    color: "#FFF",
    fontSize: 30,
    lineHeight: 34,
  },
  title: {
    fontSize: 21,
    fontWeight: "800",
    color: "#111",
    marginBottom: 14,
  },
  createCard: {
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  createTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 12,
  },
  pickButton: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  pickText: {
    color: "#FFF",
    fontWeight: "700",
  },
  previewRow: {
    marginBottom: 12,
  },
  preview: {
    width: 90,
    height: 90,
    borderRadius: 12,
    marginRight: 8,
  },
  textarea: {
    minHeight: 95,
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 14,
    padding: 12,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 14,
    padding: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  actionButton: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  actionText: {
    color: "#FFF",
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#E4D4C3",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  cancelText: {
    color: "#111",
    fontWeight: "700",
  },
  empty: {
    color: "#3A3028",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  post: {
    width: "48%",
    backgroundColor: "#FFF9F3",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  postImage: {
    width: "100%",
    height: 170,
  },
  caption: {
    padding: 10,
    color: "#2C251F",
    lineHeight: 19,
  },
});

export default TechnicianGalleryManager;