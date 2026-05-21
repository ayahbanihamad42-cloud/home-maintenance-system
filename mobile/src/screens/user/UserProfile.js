import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import Header from "../../components/Common/Header";
import API from "../../services/api";
import styles from "../../styles/mobileStyles";

export default function UserProfile({ navigation }) {
  const [profile, setProfile] = useState({});
  const [gallery, setGallery] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPost, setEditingPost] = useState(null);

  const [post, setPost] = useState({
    description: "",
    location_note: "",
    images: [],
  });

  const loadProfile = async () => {
    try {
      const res = await API.get("/auth/me");
      setProfile(res.data || {});
    } catch {}
  };

  const loadGallery = async () => {
    try {
      const res = await API.get("/technicians/gallery/my");
      setGallery(Array.isArray(res.data) ? res.data : []);
    } catch {
      setGallery([]);
    }
  };

  useEffect(() => {
    loadProfile();
    loadGallery();
  }, []);

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Notice", "Image permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      base64: true,
      quality: 0.6,
    });

    if (result.canceled) return;

    const selected = result.assets.map(
      (asset) => `data:image/jpeg;base64,${asset.base64}`
    );

    setPost((prev) => ({
      ...prev,
      images: [...prev.images, ...selected],
    }));
  };

  const savePost = async () => {
    try {
      const payload = {
        description: post.description,
        caption: post.description,
        location_note: post.location_note,
        location: post.location_note,
        images: post.images,
      };

      if (editingPost) {
        await API.put(`/technicians/gallery/${editingPost.id}`, payload);
      } else {
        await API.post("/technicians/gallery", payload);
      }

      setPost({ description: "", location_note: "", images: [] });
      setEditingPost(null);
      setShowForm(false);
      loadGallery();
    } catch (err) {
      Alert.alert(
        "Notice",
        err?.response?.data?.message || "Failed to save post."
      );
    }
  };

  const editPost = (item) => {
    setEditingPost(item);
    setPost({
      description: item.description || item.caption || "",
      location_note: item.location_note || item.location || "",
      images: safeImages(item.images),
    });
    setShowForm(true);
  };

  const deletePost = async (id) => {
    try {
      await API.delete(`/technicians/gallery/${id}`);
      loadGallery();
    } catch {
      Alert.alert("Notice", "Failed to delete post.");
    }
  };

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.pageContent}>
        <View style={styles.card}>
          <Text style={styles.pageTitle}>{profile.name || "Profile"}</Text>
          <Text style={styles.cardText}>Email: {profile.email || "-"}</Text>
          <Text style={styles.cardText}>Phone: {profile.phone || "-"}</Text>
          <Text style={styles.cardText}>City: {profile.city || "-"}</Text>
          <Text style={styles.cardText}>Role: {profile.role || "-"}</Text>
        </View>

        {String(profile.role || "").toLowerCase() === "technician" && (
          <>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.sectionTitle}>Work Gallery</Text>
              <TouchableOpacity
                style={styles.circleBtn}
                onPress={() => {
                  setShowForm(!showForm);
                  setEditingPost(null);
                  setPost({ description: "", location_note: "", images: [] });
                }}
              >
                <Text style={styles.circleBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {showForm && (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>
                  {editingPost ? "Edit Work Post" : "Add Work Post"}
                </Text>

                <TouchableOpacity style={styles.secondaryBtn} onPress={pickImages}>
                  <Text style={styles.secondaryBtnText}>Choose Images</Text>
                </TouchableOpacity>

                <ScrollView horizontal>
                  {post.images.map((img, index) => (
                    <Image key={index} source={{ uri: img }} style={styles.galleryImage} />
                  ))}
                </ScrollView>

                <Text style={styles.label}>Caption</Text>
                <TextInput
                  style={styles.textArea}
                  multiline
                  value={post.description}
                  onChangeText={(value) =>
                    setPost({ ...post, description: value })
                  }
                />

                <Text style={styles.label}>Location / Office / Work place</Text>
                <TextInput
                  style={styles.input}
                  value={post.location_note}
                  onChangeText={(value) =>
                    setPost({ ...post, location_note: value })
                  }
                />

                <TouchableOpacity style={styles.primaryBtn} onPress={savePost}>
                  <Text style={styles.primaryBtnText}>
                    {editingPost ? "Update Post" : "Save Post"}
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            {gallery.length === 0 ? (
              <View style={styles.noticeCard}>
                <Text style={styles.emptyText}>No gallery posts yet.</Text>
              </View>
            ) : (
              gallery.map((item) => (
                <View key={item.id} style={styles.card}>
                  <ScrollView horizontal>
                    {safeImages(item.images).map((img, index) => (
                      <Image
                        key={index}
                        source={{ uri: img }}
                        style={styles.galleryImage}
                      />
                    ))}
                  </ScrollView>

                  <Text style={styles.cardText}>
                    {item.description || item.caption}
                  </Text>

                  <Text style={styles.cardText}>
                    📍 {item.location_note || item.location}
                  </Text>

                  <View style={styles.rowButtons}>
                    <TouchableOpacity
                      style={styles.secondaryBtn}
                      onPress={() => editPost(item)}
                    >
                      <Text style={styles.secondaryBtnText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.dangerBtn}
                      onPress={() => deletePost(item.id)}
                    >
                      <Text style={styles.primaryBtnText}>Delete</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

function safeImages(value) {
  try {
    if (!value) return [];
    if (Array.isArray(value)) return value;
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return String(value)
      .split(",")
      .map((x) => x.trim())
      .filter(Boolean);
  }
}