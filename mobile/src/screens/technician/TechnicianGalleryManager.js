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

import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";
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
  const { t } = useTranslation();
  const { c } = useTheme();
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
        text: err.response?.data?.message || t("techGallery.failedLoad"),
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
          text: t("techGallery.allowGalleryAccess"),
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
        text: t("techGallery.failedChooseImage"),
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
          text: t("techGallery.writeCaptionFirst"),
        });
        return;
      }

      if (!form.images.length) {
        setMessage({
          type: "error",
          text: t("techGallery.chooseAtLeastOneImage"),
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
          ? t("techGallery.postUpdated")
          : t("techGallery.postAdded"),
      });

      resetForm();
      await load();
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || t("techGallery.failedSave"),
      });
    }
  };

  const deletePost = (postId) => {
    Alert.alert(t("techGallery.deleteTitle"), t("techGallery.deleteConfirm"), [
      { text: t("techGallery.cancel"), style: "cancel" },
      {
        text: t("techGallery.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            setMessage(null);
            await deleteTechnicianGalleryPost(postId);

            setMessage({
              type: "success",
              text: t("techGallery.postDeleted"),
            });

            await load();
          } catch (err) {
            setMessage({
              type: "error",
              text: err.response?.data?.message || t("techGallery.failedDelete"),
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
          <Text style={[appStyles.sectionTitle, { color: c.text }]}>{t("techGallery.workGallery")}</Text>
          <Text style={[appStyles.mutedText, { color: c.muted }]}>
            {t("techGallery.manageDesc")}
          </Text>
        </View>

        <TouchableOpacity
          onPress={startCreate}
          style={{
            width: 48,
            height: 48,
            borderRadius: 24,
            backgroundColor: c.primary,
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
        <View style={[appStyles.card, { backgroundColor: c.card }]}>
          <Text style={[appStyles.sectionTitle, { color: c.text }]}>{t("techGallery.noPosts")}</Text>
          <Text style={[appStyles.mutedText, { color: c.muted }]}>
            {t("techGallery.postsAppearHere")}
          </Text>
        </View>
      ) : (
        fixedPosts.map((post) => {
          const image = post.images?.[0];

          return (
            <TouchableOpacity
              key={post.id}
              style={[appStyles.card, { backgroundColor: c.card }]}
              activeOpacity={0.9}
              onPress={() => setViewPost(post)}
            >
              <View style={appStyles.between}>
                <Text style={[appStyles.sectionTitle, { color: c.text }]}>{t("techGallery.post")}</Text>

                <TouchableOpacity
                  onPress={() =>
                    setOpenMenuId(openMenuId === post.id ? null : post.id)
                  }
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: c.text,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Text style={{ color: c.card, fontSize: 24, fontWeight: "900" }}>
                    ⋮
                  </Text>
                </TouchableOpacity>
              </View>

              {openMenuId === post.id ? (
                <View
                  style={{
                    backgroundColor: c.menuBg,
                    borderWidth: 1,
                    borderColor: c.border,
                    borderRadius: 14,
                    padding: 10,
                    marginBottom: 12,
                    alignSelf: "flex-end",
                    minWidth: 140,
                  }}
                >
                  <TouchableOpacity onPress={() => startEdit(post)}>
                    <Text style={{ fontWeight: "900", padding: 8, color: c.text }}>{t("techGallery.edit")}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity onPress={() => deletePost(post.id)}>
                    <Text
                      style={{
                        fontWeight: "900",
                        padding: 8,
                        color: c.danger,
                      }}
                    >
                      {t("techGallery.delete")}
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

              <Text style={[appStyles.text, { color: c.text }]}>
                {cleanDescription(post) || t("techGallery.noDescription")}
              </Text>

              {getPostLocation(post) ? (
                <Text style={[appStyles.mutedText, { color: c.muted }]}>
                  📍 {getPostLocation(post)}
                </Text>
              ) : null}
            </TouchableOpacity>
          );
        })
      )}

      <Modal transparent visible={formOpen} animationType="fade">
        <View style={[appStyles.modalOverlay, { backgroundColor: c.overlay }]}>
          <View style={[appStyles.modalBox, { backgroundColor: c.card }]}>
            <Text style={[appStyles.modalTitle, { color: c.text }]}>
              {isEditing ? t("techGallery.editPost") : t("techGallery.createPost")}
            </Text>

            <TouchableOpacity style={appStyles.secondaryBtn} onPress={chooseImages}>
              <Text style={appStyles.secondaryBtnText}>{t("techGallery.chooseImages")}</Text>
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
                        backgroundColor: c.danger,
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

            <Text style={[appStyles.label, { color: c.text }]}>{t("techGallery.captionLabel")}</Text>
            <TextInput
              style={[appStyles.input, appStyles.textArea, { backgroundColor: c.inputBg, borderColor: c.border, color: c.text }]}
              value={form.description}
              onChangeText={(v) => setForm({ ...form, description: v })}
              placeholder={t("techGallery.captionPlaceholder")}
              placeholderTextColor={c.muted}
              multiline
            />

            <Text style={[appStyles.label, { color: c.text }]}>{t("techGallery.locationLabel")}</Text>
            <TextInput
              style={[appStyles.input, { backgroundColor: c.inputBg, borderColor: c.border, color: c.text }]}
              value={form.location}
              onChangeText={(v) => setForm({ ...form, location: v })}
              placeholder={t("techGallery.locationPlaceholder")}
              placeholderTextColor={c.muted}
            />

            <TouchableOpacity style={appStyles.primaryBtn} onPress={submitPost}>
              <Text style={appStyles.primaryBtnText}>
                {isEditing ? t("techGallery.updatePost") : t("techGallery.postBtn")}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.secondaryBtn} onPress={resetForm}>
              <Text style={appStyles.secondaryBtnText}>{t("techGallery.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={!!viewPost} animationType="fade">
        <View style={[appStyles.modalOverlay, { backgroundColor: c.overlay }]}>
          <View style={[appStyles.modalBox, { backgroundColor: c.card }]}>
            <View style={appStyles.between}>
              <Text style={[appStyles.modalTitle, { color: c.text }]}>{t("techGallery.postDetails")}</Text>

              <TouchableOpacity onPress={() => setViewPost(null)}>
                <Text style={{ fontSize: 28, fontWeight: "900", color: c.text }}>✕</Text>
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

              <Text style={[appStyles.text, { color: c.text }]}>
                {viewPost ? cleanDescription(viewPost) : ""}
              </Text>

              {viewPost && getPostLocation(viewPost) ? (
                <Text style={[appStyles.mutedText, { color: c.muted }]}>
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
    <SafeAreaView style={[appStyles.safe, { backgroundColor: c.bg }]}>
      <Header navigation={navigation} title={t("techGallery.headerTitle")} />

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