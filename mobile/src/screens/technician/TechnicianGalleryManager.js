import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  Modal,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import {
  getMyTechnicianGallery,
  createTechnicianGalleryPost,
  deleteTechnicianGalleryPost,
} from "../../services/technicianService";
import appStyles from "../../styles/mobileStyles";

function TechnicianGalleryManager({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [message, setMessage] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const [form, setForm] = useState({
    description: "",
    location: "",
    image: "",
  });

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
    const unsubscribe = navigation.addListener("focus", load);
    load();

    return unsubscribe;
  }, [navigation]);

  const chooseImage = async () => {
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
        mediaTypes: ["images"],
        allowsEditing: true,
        quality: 0.55,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];

      if (!asset?.base64) {
        setMessage({
          type: "error",
          text: "Failed to read selected image.",
        });
        return;
      }

      setForm((prev) => ({
        ...prev,
        image: `data:image/jpeg;base64,${asset.base64}`,
      }));
    } catch {
      setMessage({
        type: "error",
        text: "Failed to choose image.",
      });
    }
  };

  const createPost = async () => {
    try {
      setMessage(null);

      if (!form.description.trim()) {
        setMessage({
          type: "error",
          text: "Please enter description.",
        });
        return;
      }

      if (!form.image) {
        setMessage({
          type: "error",
          text: "Please choose an image.",
        });
        return;
      }

      await createTechnicianGalleryPost({
        description: form.description.trim(),
        caption: form.description.trim(),
        location: form.location.trim(),
        location_note: form.location.trim(),
        images: [form.image],
        image_url: form.image,
      });

      setMessage({
        type: "success",
        text: "Gallery post added successfully.",
      });

      setForm({
        description: "",
        location: "",
        image: "",
      });

      setModalOpen(false);

      await load();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to create gallery post.",
      });
    }
  };

  const deletePost = async (postId) => {
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
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Gallery" />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>Work Gallery</Text>
          <Text style={appStyles.heroSubtitle}>
            Add and manage your completed work posts.
          </Text>
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

        <TouchableOpacity
          style={appStyles.primaryBtn}
          onPress={() => setModalOpen(true)}
        >
          <Text style={appStyles.primaryBtnText}>Add New Post</Text>
        </TouchableOpacity>

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
              <View style={appStyles.card} key={post.id}>
                {image ? (
                  <Image
                    source={{ uri: image }}
                    style={{
                      width: "100%",
                      height: 220,
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
                  Location: {post.location_note || post.location || "-"}
                </Text>

                <TouchableOpacity
                  style={appStyles.secondaryBtn}
                  onPress={() =>
                    navigation.navigate("GalleryPostDetails", { post })
                  }
                >
                  <Text style={appStyles.secondaryBtnText}>View Details</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={appStyles.dangerBtn}
                  onPress={() => deletePost(post.id)}
                >
                  <Text style={appStyles.dangerBtnText}>Delete</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal transparent visible={modalOpen} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <Text style={appStyles.modalTitle}>Add Work Post</Text>

            <Text style={appStyles.label}>Description</Text>
            <TextInput
              style={[appStyles.input, appStyles.textArea]}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              placeholder="Describe the work..."
              multiline
            />

            <Text style={appStyles.label}>Location</Text>
            <TextInput
              style={appStyles.input}
              value={form.location}
              onChangeText={(v) => setForm({ ...form, location: v })}
              placeholder="Example: Irbid"
            />

            <TouchableOpacity style={appStyles.secondaryBtn} onPress={chooseImage}>
              <Text style={appStyles.secondaryBtnText}>
                {form.image ? "Change Image" : "Choose Image"}
              </Text>
            </TouchableOpacity>

            {form.image ? (
              <Image
                source={{ uri: form.image }}
                style={{
                  width: "100%",
                  height: 180,
                  borderRadius: 22,
                  marginTop: 14,
                }}
                resizeMode="cover"
              />
            ) : null}

            <TouchableOpacity style={appStyles.primaryBtn} onPress={createPost}>
              <Text style={appStyles.primaryBtnText}>Save Post</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={appStyles.secondaryBtn}
              onPress={() => setModalOpen(false)}
            >
              <Text style={appStyles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default TechnicianGalleryManager;