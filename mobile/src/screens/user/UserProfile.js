import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../components/Common/Header";
import API from "../../services/api";
import {
  getMyTechnicianGallery,
  deleteTechnicianGalleryPost,
} from "../../services/technicianService";

const formatDate = (value) => {
  if (!value) return "";
  const raw = String(value).trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;

  if (raw.includes("T")) {
    const date = new Date(raw);
    if (!Number.isNaN(date.getTime())) {
      return new Intl.DateTimeFormat("en-CA", {
        timeZone: "Asia/Amman",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      }).format(date);
    }
  }

  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];

  return raw.slice(0, 10);
};

const getApiHost = () => {
  const base = API?.defaults?.baseURL || "";
  return String(base).replace(/\/api\/?$/, "");
};

const getImageUrl = (url) => {
  if (!url) return null;

  const value = String(url).trim();

  if (!value) return null;
  if (value.startsWith("http://")) return value;
  if (value.startsWith("https://")) return value;
  if (value.startsWith("data:image/")) return value;

  return `${getApiHost()}${value.startsWith("/") ? value : `/${value}`}`;
};

const getProfilePhoto = (data) => {
  return (
    data?.profile_image ||
    data?.profile_photo ||
    data?.photo ||
    data?.avatar ||
    data?.image_url ||
    ""
  );
};

const parseImages = (post = {}) => {
  if (Array.isArray(post.images)) return post.images.filter(Boolean);
  if (post.image_url) return [post.image_url];
  if (post.image) return [post.image];

  try {
    const parsed = JSON.parse(post.images || "[]");
    return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
  } catch {
    return [];
  }
};

export default function UserProfile({ navigation }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [submenu, setSubmenu] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [dob, setDob] = useState("");

  const [photoPreview, setPhotoPreview] = useState("");
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);

  const [galleryPosts, setGalleryPosts] = useState([]);
  const [galleryLoading, setGalleryLoading] = useState(false);

  const [paymentInfo, setPaymentInfo] = useState({
    account_holder: "",
    wallet_name: "",
    wallet_number: "",
    mock_account_number: "",
  });

  const isTechnician =
    String(profile?.role || currentUser?.role || "").toLowerCase() ===
    "technician";

  const loadMyGallery = async () => {
    try {
      setGalleryLoading(true);
      const data = await getMyTechnicianGallery();
      setGalleryPosts(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("my gallery error:", err?.response?.data || err.message);
      setGalleryPosts([]);
    } finally {
      setGalleryLoading(false);
    }
  };

  const loadProfile = async () => {
    try {
      const raw = await AsyncStorage.getItem("user");
      const savedUser = raw ? JSON.parse(raw) : null;

      setCurrentUser(savedUser);

      if (!savedUser?.id) {
        setMessage({
          type: "error",
          title: "Error",
          body: "User id is missing. Please login again.",
        });
        return;
      }

      const res = await API.get(`/users/${savedUser.id}`);
      const data = res.data || {};

      setProfile(data);
      setName(data.name || "");
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setCity(data.city || "");
      setDob(formatDate(data.dob));
      setPhotoPreview(getProfilePhoto(data));

      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          ...savedUser,
          name: data.name,
          email: data.email,
          phone: data.phone,
          city: data.city,
          dob: data.dob,
          role: data.role,
          profile_image: data.profile_image,
          technician_id: data.technician_id || savedUser.technician_id,
        })
      );

      const role = String(data.role || savedUser.role || "").toLowerCase();
      if (role === "technician") {
        await loadMyGallery();
      } else {
        setGalleryPosts([]);
      }
    } catch (err) {
      console.log("profile load error:", err?.response?.data || err.message);
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to load profile.",
      });
    }
  };

  useEffect(() => {
    loadProfile();
    const unsubscribe = navigation.addListener("focus", loadProfile);
    return unsubscribe;
  }, [navigation]);

  const galleryList = useMemo(() => {
    return Array.isArray(galleryPosts) ? galleryPosts : [];
  }, [galleryPosts]);

  const openSoonMessage = (title) => {
    setMenuOpen(false);
    setSubmenu(null);

    setMessage({
      type: "warning",
      title,
      body: "We will add this feature soon.",
    });
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const userId = profile?.id || currentUser?.id;

      const payload = {
        name,
        email,
        phone,
        city,
        dob,
      };

      await API.patch(`/users/${userId}`, payload);

      const updatedUser = {
        ...currentUser,
        ...payload,
        profile_image: profile?.profile_image,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      setCurrentUser(updatedUser);
      setProfile((prev) => ({ ...prev, ...payload }));
      setShowEditModal(false);

      setMessage({
        type: "success",
        title: "Saved Successfully",
        body: "Profile updated successfully and we sent an email.",
      });

      await loadProfile();
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to update profile.",
      });
    } finally {
      setSaving(false);
    }
  };

  const pickProfileImage = async () => {
    try {
      setMenuOpen(false);
      setSubmenu(null);

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setMessage({
          type: "warning",
          title: "Permission",
          body: "Please allow image access.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 0.45,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.base64) return;

      const mimeType = asset.mimeType || "image/jpeg";
      const base64Image = `data:${mimeType};base64,${asset.base64}`;

      const userId = profile?.id || currentUser?.id;

      await API.patch(`/users/${userId}/photo`, {
        profile_image: base64Image,
      });

      const updatedUser = {
        ...currentUser,
        profile_image: base64Image,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      setCurrentUser(updatedUser);
      setProfile((prev) => ({ ...prev, profile_image: base64Image }));
      setPhotoPreview(base64Image);

      setMessage({
        type: "success",
        title: "Saved Successfully",
        body: "Profile photo updated successfully.",
      });

      await loadProfile();
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to update photo.",
      });
    }
  };

  const handleDeletePost = (postId) => {
    Alert.alert("Delete Post", "Are you sure you want to delete this post?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteTechnicianGalleryPost(postId);
            await loadMyGallery();
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

  const loadPaymentInfo = async () => {
    try {
      const res = await API.get("/payments/my-info");
      const data = res.data?.data || res.data || {};

      setPaymentInfo({
        account_holder: data?.account_holder || "",
        wallet_name: data?.wallet_name || "",
        wallet_number: data?.wallet_number || "",
        mock_account_number: data?.mock_account_number || "",
      });
    } catch {
      setPaymentInfo({
        account_holder: "",
        wallet_name: "",
        wallet_number: "",
        mock_account_number: "",
      });
    }
  };

  const openPaymentModal = async () => {
    setMenuOpen(false);
    setSubmenu(null);
    await loadPaymentInfo();
    setShowPaymentModal(true);
  };

  const handleSavePaymentInfo = async () => {
    try {
      await API.post("/payments/my-info", paymentInfo);

      setShowPaymentModal(false);

      setMessage({
        type: "success",
        title: "Payment Info Saved",
        body: "Your mock wallet information was saved successfully.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to save payment info.",
      });
    }
  };

  const handleShowBalance = async () => {
    try {
      setMenuOpen(false);
      setSubmenu(null);

      const res = await API.get("/payments/my-balance");
      const data = res.data?.data || res.data || {};
      const info = data.paymentInfo;

      setMessage({
        type: "success",
        title: "My Balance",
        body: `Total earnings: ${Number(data.totalEarnings || 0).toFixed(
          2
        )} JOD | Payments: ${data.totalPayments || 0} | Wallet: ${
          info?.wallet_name || "-"
        } | Wallet number: ${info?.wallet_number || "-"}`,
      });
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to load balance.",
      });
    }
  };

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      {menuOpen ? (
        <View style={styles.settingsFloating}>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => {
              setShowEditModal(true);
              setMenuOpen(false);
              setSubmenu(null);
            }}
          >
            <Text style={styles.menuText}>Edit Contact</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={pickProfileImage}>
            <Text style={styles.menuText}>Edit Profile Image</Text>
          </TouchableOpacity>

          {isTechnician ? (
            <>
              <TouchableOpacity style={styles.menuItem} onPress={openPaymentModal}>
                <Text style={styles.menuText}>Payment Info</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleShowBalance}>
                <Text style={styles.menuText}>My Balance</Text>
              </TouchableOpacity>
            </>
          ) : null}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() =>
              setSubmenu(submenu === "language" ? null : "language")
            }
          >
            <Text style={styles.menuText}>Language ▸</Text>
          </TouchableOpacity>

          {submenu === "language" ? (
            <View style={styles.subMenu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => openSoonMessage("Arabic")}
              >
                <Text style={styles.menuText}>Arabic</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => openSoonMessage("English")}
              >
                <Text style={styles.menuText}>English</Text>
              </TouchableOpacity>
            </View>
          ) : null}

          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => setSubmenu(submenu === "theme" ? null : "theme")}
          >
            <Text style={styles.menuText}>Theme ▸</Text>
          </TouchableOpacity>

          {submenu === "theme" ? (
            <View style={styles.subMenu}>
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => openSoonMessage("Light Theme")}
              >
                <Text style={styles.menuText}>Light</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => openSoonMessage("Dark Theme")}
              >
                <Text style={styles.menuText}>Dark</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>
      ) : null}

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.headerRow}>
            <View style={styles.identityRow}>
              <View style={styles.avatarLarge}>
                {photoPreview ? (
                  <Image source={{ uri: photoPreview }} style={styles.avatarImage} />
                ) : (
                  <Text style={styles.avatarText}>
                    {String(profile?.name || currentUser?.name || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </Text>
                )}
              </View>

              <View style={styles.titleBlock}>
                <Text style={styles.name}>
                  {profile?.name || currentUser?.name || "User"}
                </Text>

                <Text style={styles.roleBadge}>
                  {profile?.role || currentUser?.role || "user"}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => {
                setMenuOpen((prev) => !prev);
                setSubmenu(null);
              }}
            >
              <Text style={styles.settingsIcon}>⚙</Text>
            </TouchableOpacity>
          </View>

          {message ? (
            <View style={[styles.messageBox, styles[`${message.type}Box`]]}>
              <Text style={styles.messageTitle}>{message.title}</Text>
              <Text style={styles.messageBody}>{message.body}</Text>
            </View>
          ) : null}

          <View style={styles.profileInfo}>
            <Text style={styles.infoText}>
              <Text style={styles.bold}>Email:</Text> {profile?.email || "-"}
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.bold}>Phone:</Text> {profile?.phone || "-"}
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.bold}>City:</Text> {profile?.city || "-"}
            </Text>

            <Text style={styles.infoText}>
              <Text style={styles.bold}>Birth Date:</Text>{" "}
              {formatDate(profile?.dob) || "-"}
            </Text>
          </View>

          {isTechnician ? (
            <>
              <View style={styles.dividerWrap}>
                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.plusBtn}
                  onPress={() => navigation.navigate("TechnicianGalleryManager")}
                >
                  <Text style={styles.plusText}>＋</Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.galleryLabel}>My Work Gallery</Text>

              {galleryLoading ? (
                <Text style={styles.emptyGallery}>Loading posts...</Text>
              ) : galleryList.length === 0 ? (
                <Text style={styles.emptyGallery}>No posts yet.</Text>
              ) : (
                galleryList.map((post) => {
                  const images = parseImages(post);

                  return (
                    <TouchableOpacity
                      key={post.id}
                      style={styles.postCard}
                      onPress={() =>
                        navigation.navigate("GalleryPostDetails", {
                          post,
                          canEdit: true,
                          readOnly: false,
                        })
                      }
                    >
                      <View style={styles.postTop}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.postCaption}>
                            {post.description || post.caption || "No caption"}
                          </Text>

                          {post.location_note || post.location ? (
                            <Text style={styles.postLocation}>
                              📍 {post.location_note || post.location}
                            </Text>
                          ) : null}
                        </View>

                        <TouchableOpacity
                          style={styles.postDots}
                          onPress={() =>
                            navigation.navigate("GalleryPostDetails", {
                              post,
                              canEdit: true,
                              readOnly: false,
                            })
                          }
                        >
                          <Text style={styles.postDotsText}>⋮</Text>
                        </TouchableOpacity>
                      </View>

                      {images.length > 0 ? (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                          {images.map((img, index) => (
                            <Image
                              key={`${post.id}-${index}`}
                              source={{ uri: getImageUrl(img) }}
                              style={styles.postImage}
                            />
                          ))}
                        </ScrollView>
                      ) : (
                        <Text style={styles.emptyGallery}>No images attached.</Text>
                      )}

                      <View style={styles.postActions}>
                        <TouchableOpacity
                          style={styles.editPostBtn}
                          onPress={() =>
                            navigation.navigate("TechnicianGalleryManager", {
                              editMode: true,
                              post,
                              postId: post.id,
                            })
                          }
                        >
                          <Text style={styles.editPostText}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                          style={styles.deletePostBtn}
                          onPress={() => handleDeletePost(post.id)}
                        >
                          <Text style={styles.deletePostText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </>
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={showEditModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Update Contact</Text>

            <Text style={styles.label}>Name</Text>
            <TextInput value={name} onChangeText={setName} style={styles.input} />

            <Text style={styles.label}>Email</Text>
            <TextInput value={email} onChangeText={setEmail} style={styles.input} />

            <Text style={styles.label}>Phone</Text>
            <TextInput value={phone} onChangeText={setPhone} style={styles.input} />

            <Text style={styles.label}>City</Text>
            <TextInput value={city} onChangeText={setCity} style={styles.input} />

            <Text style={styles.label}>Birth Date</Text>
            <TextInput
              value={dob}
              onChangeText={setDob}
              style={styles.input}
              placeholder="YYYY-MM-DD"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={styles.secondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSaveProfile}
                disabled={saving}
              >
                <Text style={styles.primaryText}>
                  {saving ? "Saving..." : "Save"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPaymentModal} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Mock Payment Info</Text>

            <Text style={styles.label}>Account Holder</Text>
            <TextInput
              value={paymentInfo.account_holder}
              onChangeText={(value) =>
                setPaymentInfo({ ...paymentInfo, account_holder: value })
              }
              style={styles.input}
            />

            <Text style={styles.label}>Wallet Name</Text>
            <TextInput
              value={paymentInfo.wallet_name}
              onChangeText={(value) =>
                setPaymentInfo({ ...paymentInfo, wallet_name: value })
              }
              style={styles.input}
            />

            <Text style={styles.label}>Wallet Number</Text>
            <TextInput
              value={paymentInfo.wallet_number}
              onChangeText={(value) =>
                setPaymentInfo({ ...paymentInfo, wallet_number: value })
              }
              style={styles.input}
            />

            <Text style={styles.label}>Mock Account Number</Text>
            <TextInput
              value={paymentInfo.mock_account_number}
              onChangeText={(value) =>
                setPaymentInfo({ ...paymentInfo, mock_account_number: value })
              }
              style={styles.input}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.secondaryBtn}
                onPress={() => setShowPaymentModal(false)}
              >
                <Text style={styles.secondaryText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={handleSavePaymentInfo}
              >
                <Text style={styles.primaryText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E8DCCF" },
  container: { padding: 22, paddingBottom: 90 },

  settingsFloating: {
    position: "absolute",
    top: 88,
    right: 22,
    width: 250,
    backgroundColor: "#FFF9F3",
    borderRadius: 22,
    padding: 10,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 20,
    zIndex: 9999,
  },
  menuItem: {
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 14,
  },
  menuText: { color: "#111", fontSize: 16, fontWeight: "900" },
  subMenu: {
    marginLeft: 12,
    backgroundColor: "#F7EFE7",
    borderRadius: 16,
    padding: 6,
  },

  profileCard: {
    backgroundColor: "#FFF9F3",
    borderRadius: 30,
    padding: 22,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 18,
  },
  identityRow: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarLarge: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    marginRight: 14,
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: "#FFF", fontSize: 34, fontWeight: "900" },
  titleBlock: { flex: 1 },
  name: { fontSize: 28, fontWeight: "900", color: "#111" },
  roleBadge: {
    marginTop: 6,
    alignSelf: "flex-start",
    backgroundColor: "#F7EFE7",
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    color: "#6B5E55",
    fontWeight: "900",
    textTransform: "capitalize",
  },
  settingsBtn: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  settingsIcon: { color: "#FFF", fontSize: 22 },

  messageBox: {
    borderRadius: 18,
    padding: 14,
    marginBottom: 14,
    backgroundColor: "#F7EFE7",
  },
  successBox: { backgroundColor: "#EAF7EC" },
  errorBox: { backgroundColor: "#FDEBED" },
  warningBox: { backgroundColor: "#FFF3D8" },
  messageTitle: { fontSize: 16, fontWeight: "900", color: "#111" },
  messageBody: { fontSize: 15, fontWeight: "700", color: "#5C5048" },

  profileInfo: { marginTop: 8 },
  infoText: {
    fontSize: 17,
    color: "#2F2723",
    marginBottom: 10,
    lineHeight: 24,
  },
  bold: { fontWeight: "900", color: "#111" },

  dividerWrap: {
    marginTop: 28,
    marginBottom: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  divider: {
    height: 1,
    backgroundColor: "#B9A898",
    width: "100%",
  },
  plusBtn: {
    position: "absolute",
    backgroundColor: "#111",
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: "center",
    justifyContent: "center",
  },
  plusText: { color: "#FFF", fontSize: 28, fontWeight: "900" },
  galleryLabel: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
    marginBottom: 12,
  },
  emptyGallery: {
    fontSize: 16,
    color: "#6B5E55",
    marginBottom: 12,
  },
  postCard: {
    backgroundColor: "#F7EFE7",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#E2D3C4",
    padding: 14,
    marginBottom: 14,
  },
  postTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    marginBottom: 10,
  },
  postCaption: {
    color: "#111",
    fontWeight: "900",
    fontSize: 16,
    lineHeight: 22,
  },
  postLocation: {
    color: "#3A3028",
    marginTop: 5,
    fontSize: 15,
  },
  postDots: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
  },
  postDotsText: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "900",
  },
  postImage: {
    width: 130,
    height: 100,
    borderRadius: 14,
    marginRight: 8,
    backgroundColor: "#E8DCCF",
  },
  postActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
  },
  editPostBtn: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  editPostText: {
    color: "#FFF",
    fontWeight: "900",
  },
  deletePostBtn: {
    backgroundColor: "#7A1F1F",
    borderRadius: 999,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  deletePostText: {
    color: "#FFF",
    fontWeight: "900",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    width: "100%",
    backgroundColor: "#FFF9F3",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#111",
    marginBottom: 14,
  },
  label: {
    fontSize: 16,
    fontWeight: "900",
    color: "#2F2723",
    marginTop: 10,
    marginBottom: 7,
  },
  input: {
    backgroundColor: "#F7EFE7",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 18,
    minHeight: 54,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#111",
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 20,
  },
  secondaryBtn: {
    backgroundColor: "#F7EFE7",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 22,
    paddingVertical: 13,
    paddingHorizontal: 20,
  },
  secondaryText: { color: "#111", fontWeight: "900", fontSize: 16 },
  primaryBtn: {
    backgroundColor: "#111",
    borderRadius: 22,
    paddingVertical: 13,
    paddingHorizontal: 22,
  },
  primaryText: { color: "#FFF", fontWeight: "900", fontSize: 16 },
});