import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Header from "../../components/Common/Header";
import {
  getMyTechnicianGallery,
  createTechnicianGalleryPost,
  updateTechnicianGalleryPost,
  deleteTechnicianGalleryPost,
} from "../../services/technicianService";

function TechnicianGalleryManager({ route, navigation }) {
  const editPostFromRoute = route?.params?.post || null;

  const [posts, setPosts] = useState([]);
  const [description, setDescription] = useState("");
  const [locationNote, setLocationNote] = useState("");
  const [images, setImages] = useState([]);
  const [editingPostId, setEditingPostId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEditing = useMemo(() => Boolean(editingPostId), [editingPostId]);

  const parseImages = (value) => {
    if (!value) return [];

    if (Array.isArray(value)) return value.filter(Boolean);

    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch {
      return [];
    }
  };

  const loadPosts = async () => {
    try {
      setLoading(true);
      const data = await getMyTechnicianGallery();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log(
        "MOBILE gallery load error:",
        err?.response?.data || err?.message
      );
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  useEffect(() => {
    if (editPostFromRoute?.id) {
      startEdit(editPostFromRoute);
    }
  }, [editPostFromRoute?.id]);

  const resetForm = () => {
    setDescription("");
    setLocationNote("");
    setImages([]);
    setEditingPostId(null);
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Notice", "Please allow image access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      base64: true,
      quality: 0.22,
    });

    if (result.canceled) return;

    const selected = (result.assets || [])
      .filter((asset) => asset?.base64)
      .map((asset) => {
        const mimeType = asset.mimeType || "image/jpeg";
        return `data:${mimeType};base64,${asset.base64}`;
      });

    if (!selected.length) return;

    setImages((prev) => [...prev, ...selected].slice(0, 6));
  };

  const removeImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const startEdit = (post) => {
    setEditingPostId(post.id);
    setDescription(post.description || "");
    setLocationNote(post.location_note || post.location || "");
    setImages(parseImages(post.images));
  };

  const handleSave = async () => {
    if (!description.trim()) {
      Alert.alert("Notice", "Caption is required.");
      return;
    }

    if (!images.length) {
      Alert.alert("Notice", "At least one image is required.");
      return;
    }

    try {
      setSaving(true);

      const payload = {
        description: description.trim(),
        location_note: locationNote.trim(),
        images,
      };

      if (isEditing) {
        await updateTechnicianGalleryPost(editingPostId, payload);
      } else {
        await createTechnicianGalleryPost(payload);
      }

      resetForm();
      await loadPosts();
      Alert.alert("Success", isEditing ? "Post updated." : "Post added.");
    } catch (err) {
      console.log(
        "MOBILE gallery save error:",
        err?.response?.data || err?.message
      );

      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to save post."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTechnicianGalleryPost(postId);
            await loadPosts();

            if (editingPostId === postId) {
              resetForm();
            }
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

  return (
    <>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.navigate("TechnicianDashboard")}
        >
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Work Gallery</Text>

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {isEditing ? "Edit Post" : "Add New Post"}
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Caption / description"
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <TextInput
            style={styles.input}
            placeholder="Location"
            value={locationNote}
            onChangeText={setLocationNote}
          />

          <TouchableOpacity style={styles.secondaryBtn} onPress={pickImages}>
            <Text style={styles.secondaryText}>Choose Images</Text>
          </TouchableOpacity>

          {images.length ? (
            <ScrollView horizontal style={styles.previewRow}>
              {images.map((img, index) => (
                <View key={`${index}-${img.slice(0, 20)}`} style={styles.previewBox}>
                  <Image source={{ uri: img }} style={styles.previewImage} />

                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeText}>×</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          ) : null}

          <View style={styles.formActions}>
            <TouchableOpacity
              style={[styles.primaryBtn, saving && { opacity: 0.6 }]}
              disabled={saving}
              onPress={handleSave}
            >
              <Text style={styles.primaryText}>
                {saving ? "Saving..." : isEditing ? "Update Post" : "Add Post"}
              </Text>
            </TouchableOpacity>

            {isEditing ? (
              <TouchableOpacity style={styles.cancelBtn} onPress={resetForm}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        <Text style={styles.sectionTitle}>My Posts</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#111" />
        ) : posts.length === 0 ? (
          <Text style={styles.empty}>No posts yet.</Text>
        ) : (
          posts.map((post) => {
            const postImages = parseImages(post.images);

            return (
              <View key={post.id} style={styles.postCard}>
                <View style={styles.postTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.postCaption}>
                      {post.description || "No caption"}
                    </Text>

                    {post.location_note ? (
                      <Text style={styles.postLocation}>
                        📍 {post.location_note}
                      </Text>
                    ) : null}
                  </View>

                  <View style={styles.dotsBox}>
                    <TouchableOpacity
                      style={styles.smallBtn}
                      onPress={() => startEdit(post)}
                    >
                      <Text style={styles.smallBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => handleDelete(post.id)}
                    >
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <ScrollView horizontal>
                  {postImages.map((img, index) => (
                    <Image
                      key={`${post.id}-${index}`}
                      source={{ uri: img }}
                      style={styles.postImage}
                    />
                  ))}
                </ScrollView>
              </View>
            );
          })
        )}
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#E8DCCF",
    flexGrow: 1,
    padding: 16,
  },
  backBtn: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  backText: {
    color: "#FFF",
    fontWeight: "900",
  },
  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111",
    marginBottom: 14,
  },
  formCard: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 20,
    padding: 16,
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
    marginBottom: 12,
  },
  input: {
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    color: "#111",
    minHeight: 48,
  },
  secondaryBtn: {
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  secondaryText: {
    color: "#111",
    fontWeight: "900",
  },
  previewRow: {
    marginVertical: 10,
  },
  previewBox: {
    position: "relative",
    marginRight: 10,
  },
  previewImage: {
    width: 90,
    height: 80,
    borderRadius: 12,
  },
  removeBtn: {
    position: "absolute",
    top: -7,
    right: -7,
    backgroundColor: "#B00020",
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  removeText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "900",
  },
  formActions: {
    flexDirection: "row",
    gap: 10,
  },
  primaryBtn: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  primaryText: {
    color: "#FFF",
    fontWeight: "900",
  },
  cancelBtn: {
    backgroundColor: "#D8C8B8",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
  cancelText: {
    color: "#111",
    fontWeight: "900",
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
    marginBottom: 12,
  },
  empty: {
    textAlign: "center",
    color: "#3A3028",
    marginTop: 20,
    fontSize: 16,
  },
  postCard: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
  },
  postTop: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 10,
  },
  postCaption: {
    color: "#111",
    fontWeight: "900",
    fontSize: 16,
  },
  postLocation: {
    color: "#3A3028",
    marginTop: 4,
  },
  dotsBox: {
    gap: 6,
  },
  smallBtn: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  smallBtnText: {
    color: "#FFF",
    fontWeight: "900",
  },
  deleteBtn: {
    backgroundColor: "#B00020",
    borderRadius: 999,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  deleteBtnText: {
    color: "#FFF",
    fontWeight: "900",
  },
  postImage: {
    width: 120,
    height: 95,
    borderRadius: 12,
    marginRight: 8,
    backgroundColor: "#111",
  },
});

export default TechnicianGalleryManager;