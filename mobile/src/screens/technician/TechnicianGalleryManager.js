import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import {
  getMyTechnicianGallery,
  createTechnicianGalleryPost,
  updateTechnicianGalleryPost,
  deleteTechnicianGalleryPost,
} from "../../services/technicianService";
import appStyles, { colors } from "../../styles/mobileStyles";

function TechnicianGalleryManager({
  navigation,
  embedded = false,
  technicianId = "",
}) {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [viewPost, setViewPost] = useState(null);
  const [openMenuId, setOpenMenuId] = useState(null);
  const [editingId, setEditingId] = useState(null);

  const [form, setForm] = useState({
    description: "",
    location: "",
    images: [],
  });

  const isEditing = Boolean(editingId);

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

  const getPostLocation = (post) => {
    if (post.location_note) return post.location_note;
    if (post.location) return post.location;

    const text = post.description || "";
    const match = text.match(/Location:\s*(.+)$/i);
    return match ? match[1].trim() : "";
  };

  const cleanDescription = (post) => {
    const text = post.description || post.caption || "";
    return text.replace(/\n\nLocation:\s*.+$/i, "").trim();
  };

  const fixedPosts = useMemo(() => {
    return posts.map((post) => ({
      ...post,
      images: normalizeImages(post),
    }));
  }, [posts]);

  const load = async () => {
    try {
      setMessage(null);

      const data = await getMyTechnicianGallery();
      setPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      setPosts([]);
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to load gallery.",
      });
    }
  };

  useEffect(() => {
    if (navigation && !embedded) {
      const unsubscribe = navigation.addListener("focus", load);
      load();
      return unsubscribe;
    }

    load();
  }, [navigation, embedded, technicianId]);

  const resetForm = () => {
    setEditingId(null);
    setForm({
      description: "",
      location: "",
      images: [],
    });
    setFormOpen(false);
    setOpenMenuId(null);
  };

  const chooseImages = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setMessage({
          type: "error",
          text: "Please allow gallery access.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 0.55,
        base64: true,
        allowsMultipleSelection: true,
      });

      if (result.canceled) return;

      const images = (result.assets || [])
        .filter((asset) => asset?.base64)
        .map((asset) => `data:image/jpeg;base64,${asset.base64}`);

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...images].slice(0, 6),
      }));
    } catch {
      setMessage({
        type: "error",
        text: "Failed to choose image.",
      });
    }
  };

  const removeImage = (index) => {
    setForm((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const startCreate = () => {
    setEditingId(null);
    setForm({
      description: "",
      location: "",
      images: [],
    });
    setFormOpen(true);
  };

  const startEdit = (post) => {
    setEditingId(post.id);
    setForm({
      description: cleanDescription(post),
      location: getPostLocation(post),
      images: normalizeImages(post),
    });
    setOpenMenuId(null);
    setFormOpen(true);
  };

  const submitPost = async () => {
    try {
      setMessage(null);

      if (!form.description.trim()) {
        setMessage({
          type: "error",
          text: "Write a caption first.",
        });
        return;
      }

      if (!form.images.length) {
        setMessage({
          type: "error",
          text: "Choose at least one image.",
        });
        return;
      }

      const payload = {
        description: form.description.trim(),
        caption: form.description.trim(),
        location: form.location.trim(),
        location_note: form.location.trim(),
        images: form.images,
        image_url: form.images[0],
      };

      if (isEditing) {
        await updateTechnicianGalleryPost(editingId, payload);
      } else {
        await createTechnicianGalleryPost(payload);
      }

      setMessage({
        type: "success",
        text: isEditing
          ? "Gallery post updated successfully."
          : "Gallery post added successfully.",
      });

      resetForm();
      await load();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to save gallery post.",
      });
    }
  };

  const deletePost = (postId) => {
    Alert.alert("Delete", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            setMessage(null);
            await deleteTechnicianGalleryPost(postId);

            setMessage({
              type: "success",
              text: "Gallery post deleted successfully.",
            });

            await load();
          } catch (err) {
            setMessage({
              type: "error",
              text: err.response?.data?.message || "Failed to delete post.",
            });
          }
        },
      },
    ]);
  };

  const content = (
    <>
      <View style={appStyles.between}>
        <View style={{ flex: 1 }}>
          <Text style={appStyles.sectionTitle}>Work Gallery</Text>
          <Text style={appStyles.mutedText}>
            Add and manage your completed work posts.
          </Text>
        </View>

        <TouchableOpacity
          onPress={startCreate}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: colors.primary,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 30, fontWeight: "900" }}>
            +
          </Text>
        </TouchableOpacity>
      </View>

      {message ? (
        <View
          style={
            message.type === "success"
              ? appStyles.successBox
              : appStyles.errorBox
          }
        >
          <Text
            style={
              message.type === "success"
                ? appStyles.successText
                : appStyles.errorText
            }
          >
            {message.text}
          </Text>
        </View>
      ) : null}

      {fixedPosts.length === 0 ? (
        <View style={appStyles.card}>
          <Text style={appStyles.sectionTitle}>No posts yet</Text>
          <Text style={appStyles.mutedText}>
            Your work gallery posts will appear here.
          </Text>
        </View>
      ) : (
        fixedPosts.map((post) => {
          const image = post.images?.[0];

          return (
            <TouchableOpacity
              key={post.id}
              style={appStyles.card}
              activeOpacity={0.9}
              onPress={() => setViewPost(post)}
            >
              <View style={appStyles.between}>
                <Text style={appStyles.sectionTitle}>Post</Text>

                <TouchableOpacity
                  onPress={() =>
                    setOpenMenuId(openMenuId === post.id ? null : post.id)
                  }
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: "#111",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: "#fff", fontSize: 24, fontWeight: "900" }}>
                    ⋮
                  </Text>
                </TouchableOpacity>
              </View>

              {openMenuId === post.id ? (
                <View
                  style={{
                    backgroundColor: "#fff9f3",
                    borderWidth: 1,
                    borderColor: "#d8c8b8",
                    borderRadius: 14,
                    padding: 10,
                    marginBottom: 12,
                    alignSelf: "flex-end",
                    minWidth: 140,
                  }}
                >
                  <TouchableOpacity onPress={() => startEdit(post)}>
                    <Text style={{ fontWeight: "900", padding: 8 }}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deletePost(post.id)}>
                    <Text
                      style={{
                        fontWeight: "900",
                        padding: 8,
                        color: "#b00020",
                      }}
                    >
                      Delete
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : null}

              {image ? (
                <Image
                  source={{ uri: image }}
                  style={{
                    width: "100%",
                    height: 240,
                    borderRadius: 22,
                    marginBottom: 14,
                  }}
                  resizeMode="cover"
                />
              ) : null}

              <Text style={appStyles.text}>
                {cleanDescription(post) || "No description"}
              </Text>

              {getPostLocation(post) ? (
                <Text style={appStyles.mutedText}>
                  📍 {getPostLocation(post)}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })
      )}

      <Modal transparent visible={formOpen} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <Text style={appStyles.modalTitle}>
              {isEditing ? "Edit Work Post" : "Create New Work Post"}
            </Text>

            <TouchableOpacity style={appStyles.secondaryBtn} onPress={chooseImages}>
              <Text style={appStyles.secondaryBtnText}>Choose Images</Text>
            </TouchableOpacity>

            {form.images.length > 0 ? (
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {form.images.map((img, index) => (
                  <View key={`${index}-${img.slice(0, 20)}`} style={{ marginRight: 10 }}>
                    <Image
                      source={{ uri: img }}
                      style={{
                        width: 120,
                        height: 120,
                        borderRadius: 18,
                      }}
                    />

                    <TouchableOpacity
                      onPress={() => removeImage(index)}
                      style={{
                        position: "absolute",
                        top: 4,
                        right: 4,
                        width: 28,
                        height: 28,
                        borderRadius: 14,
                        backgroundColor: "#b00020",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "900" }}>×</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            ) : null}

            <Text style={appStyles.label}>Caption</Text>
            <TextInput
              style={[appStyles.input, appStyles.textArea]}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              placeholder="Write caption / work details..."
              multiline
            />

            <Text style={appStyles.label}>Location / Work place</Text>
            <TextInput
              style={appStyles.input}
              value={form.location}
              onChangeText={(v) => setForm({ ...form, location: v })}
              placeholder="Example: Irbid, customer house..."
            />

            <TouchableOpacity style={appStyles.primaryBtn} onPress={submitPost}>
              <Text style={appStyles.primaryBtnText}>
                {isEditing ? "Update Post" : "Post"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.secondaryBtn} onPress={resetForm}>
              <Text style={appStyles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={!!viewPost} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <View style={appStyles.between}>
              <Text style={appStyles.modalTitle}>Post Details</Text>

              <TouchableOpacity onPress={() => setViewPost(null)}>
                <Text style={{ fontSize: 28, fontWeight: "900" }}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {(viewPost?.images || []).map((img, index) => (
                <Image
                  key={`${index}-${img}`}
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
                {viewPost ? cleanDescription(viewPost) : ""}
              </Text>

              {viewPost && getPostLocation(viewPost) ? (
                <Text style={appStyles.mutedText}>
                  📍 {getPostLocation(viewPost)}
                </Text>
              ) : null}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </>
  );

  if (embedded) {
    return <View style={{ marginTop: 8 }}>{content}</View>;
  }

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Gallery" />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        {content}
      </ScrollView>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default TechnicianGalleryManager;