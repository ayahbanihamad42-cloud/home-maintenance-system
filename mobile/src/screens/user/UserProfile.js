import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Alert,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Header from "../../components/Common/Header";
import API from "../../services/api";

export default function UserProfile({ navigation }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    dob: "",
    profile_image: "",
  });

  const [loading, setLoading] = useState(true);
  const [editingContact, setEditingContact] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState(false);
  const [message, setMessage] = useState(null);

  const loadProfile = async () => {
    try {
      setLoading(true);
      setMessage(null);

      const rawUser = await AsyncStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;

      if (!user?.id) {
        setMessage({
          type: "error",
          title: "Notice",
          body: "User id is missing. Please login again.",
        });
        return;
      }

      const res = await API.get(`/users/${user.id}`);
      const data = res.data || {};

      setProfile(data);
      setForm({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        city: data.city || "",
        dob: data.dob ? String(data.dob).split("T")[0] : "",
        profile_image: data.profile_image || "",
      });
    } catch (err) {
      console.log("profile error:", err?.response?.data || err.message);
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to load profile.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", loadProfile);
    return unsubscribe;
  }, [navigation]);

  const pickPhoto = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Notice", "Image permission is required.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      quality: 0.6,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.base64) return;

    const mime = asset.mimeType || "image/jpeg";

    setForm((prev) => ({
      ...prev,
      profile_image: `data:${mime};base64,${asset.base64}`,
    }));

    setEditingPhoto(true);
  };

  const saveProfile = async () => {
    try {
      setMessage(null);

      const rawUser = await AsyncStorage.getItem("user");
      const user = rawUser ? JSON.parse(rawUser) : null;

      if (!user?.id) {
        setMessage({
          type: "error",
          title: "Notice",
          body: "User id is missing. Please login again.",
        });
        return;
      }

      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone,
        city: form.city,
        dob: form.dob || null,
        profile_image: form.profile_image,
      };

      const res = await API.patch(`/users/${user.id}`, payload);
      const updated = res.data?.user || res.data || payload;

      const safeUser = {
        ...user,
        name: updated.name || payload.name,
        email: updated.email || payload.email,
        phone: updated.phone || payload.phone,
        city: updated.city || payload.city,
        dob: updated.dob || payload.dob,
        profile_image: updated.profile_image || payload.profile_image,
      };

      await AsyncStorage.setItem("user", JSON.stringify(safeUser));

      setProfile(safeUser);
      setEditingContact(false);
      setEditingPhoto(false);

      setMessage({
        type: "success",
        title: "Profile Updated",
        body: "Your profile was updated successfully and an email notification was sent.",
      });
    } catch (err) {
      console.log("save profile error:", err?.response?.data || err.message);
      setMessage({
        type: "error",
        title: "Update Failed",
        body: err?.response?.data?.message || "Failed to update profile.",
      });
    }
  };

  const initial = String(form.name || profile?.name || "U").charAt(0).toUpperCase();

  return (
    <View style={styles.screen}>
      <Header navigation={navigation} />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          {loading ? (
            <ActivityIndicator color="#111" size="large" />
          ) : (
            <>
              {message ? (
                <View
                  style={[
                    styles.messageBox,
                    message.type === "error" && styles.errorBox,
                    message.type === "success" && styles.successBox,
                  ]}
                >
                  <Text style={styles.messageTitle}>{message.title}</Text>
                  <Text style={styles.messageBody}>{message.body}</Text>
                </View>
              ) : null}

              <View style={styles.profileHeader}>
                <TouchableOpacity style={styles.avatar} onPress={pickPhoto}>
                  {form.profile_image ? (
                    <Image source={{ uri: form.profile_image }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarText}>{initial}</Text>
                  )}
                </TouchableOpacity>

                <View style={{ flex: 1 }}>
                  <Text style={styles.profileName}>{form.name || "Profile"}</Text>
                  <Text style={styles.roleBadge}>{profile?.role || "user"}</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.settingRow}
                onPress={() => setEditingContact(!editingContact)}
              >
                <Text style={styles.settingIcon}>⚙️</Text>
                <Text style={styles.settingText}>Edit Contact</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.settingRow} onPress={pickPhoto}>
                <Text style={styles.settingIcon}>🖼️</Text>
                <Text style={styles.settingText}>Edit Photo</Text>
              </TouchableOpacity>

              <View style={styles.settingRow}>
                <Text style={styles.settingIcon}>🌐</Text>
                <Text style={styles.settingText}>Language: Arabic</Text>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingIcon}>🌐</Text>
                <Text style={styles.settingText}>Language: English</Text>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingIcon}>☀️</Text>
                <Text style={styles.settingText}>Theme: Light</Text>
              </View>

              <View style={styles.settingRow}>
                <Text style={styles.settingIcon}>🌙</Text>
                <Text style={styles.settingText}>Theme: Dark</Text>
              </View>

              {editingContact || editingPhoto ? (
                <View style={styles.editBox}>
                  <Text style={styles.label}>Name</Text>
                  <TextInput
                    style={styles.input}
                    value={form.name}
                    onChangeText={(v) => setForm({ ...form, name: v })}
                  />

                  <Text style={styles.label}>Email</Text>
                  <TextInput
                    style={styles.input}
                    value={form.email}
                    onChangeText={(v) => setForm({ ...form, email: v })}
                    keyboardType="email-address"
                  />

                  <Text style={styles.label}>Phone</Text>
                  <TextInput
                    style={styles.input}
                    value={form.phone}
                    onChangeText={(v) => setForm({ ...form, phone: v })}
                  />

                  <Text style={styles.label}>City</Text>
                  <TextInput
                    style={styles.input}
                    value={form.city}
                    onChangeText={(v) => setForm({ ...form, city: v })}
                  />

                  <Text style={styles.label}>Birth Date</Text>
                  <TextInput
                    style={styles.input}
                    value={form.dob}
                    onChangeText={(v) => setForm({ ...form, dob: v })}
                    placeholder="YYYY-MM-DD"
                  />

                  <TouchableOpacity style={styles.primaryBtn} onPress={saveProfile}>
                    <Text style={styles.primaryText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.infoBox}>
                  <Text style={styles.info}>Email: {form.email || "-"}</Text>
                  <Text style={styles.info}>Phone: {form.phone || "-"}</Text>
                  <Text style={styles.info}>City: {form.city || "-"}</Text>
                  <Text style={styles.info}>Birth Date: {form.dob || "-"}</Text>
                </View>
              )}
            </>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E7DCCC" },
  container: { padding: 24, paddingBottom: 80 },
  card: {
    backgroundColor: "#FFFAF4",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 26,
    padding: 24,
    shadowColor: "#000",
    shadowOpacity: 0.13,
    shadowRadius: 12,
    elevation: 5,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 22,
    gap: 16,
  },
  avatar: {
    width: 66,
    height: 66,
    borderRadius: 33,
    backgroundColor: "#111",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: { width: "100%", height: "100%" },
  avatarText: { color: "#fff", fontSize: 26, fontWeight: "900" },
  profileName: { fontSize: 30, fontWeight: "900", color: "#111" },
  roleBadge: {
    alignSelf: "flex-start",
    marginTop: 6,
    backgroundColor: "#F1E6DA",
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 999,
    fontWeight: "900",
    overflow: "hidden",
  },
  settingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
  },
  settingIcon: { fontSize: 22, width: 34 },
  settingText: { fontSize: 21, color: "#111" },
  infoBox: { marginTop: 10 },
  info: { fontSize: 21, marginTop: 8, color: "#111" },
  editBox: { marginTop: 12 },
  label: { fontSize: 16, fontWeight: "900", marginTop: 12, marginBottom: 7 },
  input: {
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 18,
    minHeight: 54,
    paddingHorizontal: 16,
    fontSize: 17,
  },
  primaryBtn: {
    backgroundColor: "#111",
    alignSelf: "flex-start",
    paddingHorizontal: 24,
    paddingVertical: 15,
    borderRadius: 18,
    marginTop: 18,
  },
  primaryText: { color: "#fff", fontWeight: "900", fontSize: 16 },
  messageBox: {
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
    marginBottom: 18,
  },
  errorBox: { backgroundColor: "#FDEBED", borderColor: "#EFB6BD" },
  successBox: { backgroundColor: "#EEF9F1", borderColor: "#BFE7CA" },
  messageTitle: { fontSize: 16, fontWeight: "900" },
  messageBody: { fontSize: 15, marginTop: 6, color: "#6B5E52" },
});