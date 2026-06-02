import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Image,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import {
  getUserProfile,
  updateUserProfile,
  updateUserPhoto,
} from "../../services/userService";
import appStyles, { colors } from "../../styles/mobileStyles";

const UserProfile = ({ navigation }) => {
  const [user, setUser] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [optionOpen, setOptionOpen] = useState(null);
  const [message, setMessage] = useState(null);

  const [form, setForm] = useState({
    email: "",
    phone: "",
    city: "",
    dob: "",
  });

  const profileImage =
    user.profile_image ||
    user.profileImage ||
    user.photo ||
    user.image ||
    "";

  const firstLetter = String(user.name || "U").charAt(0).toUpperCase();

  const load = async () => {
    try {
      const raw = await AsyncStorage.getItem("user");
      const localUser = raw ? JSON.parse(raw) : {};

      let fullUser = localUser;

      if (localUser?.id) {
        try {
          fullUser = await getUserProfile(localUser.id);
        } catch {
          fullUser = localUser;
        }
      }

      setUser(fullUser);

      setForm({
        email: fullUser.email || "",
        phone: fullUser.phone || "",
        city: fullUser.city || "",
        dob: fullUser.dob ? String(fullUser.dob).slice(0, 10) : "",
      });

      await AsyncStorage.setItem("user", JSON.stringify(fullUser));
    } catch {
      setUser({});
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", load);
    load();

    return unsubscribe;
  }, [navigation]);

  const saveContact = async () => {
    try {
      setMessage(null);

      const updatedData = await updateUserProfile(user.id, {
        email: form.email.trim(),
        phone: form.phone.trim(),
        city: form.city.trim(),
        dob: form.dob.trim(),
      });

      const updatedUser = {
        ...user,
        ...form,
        ...updatedData,
      };

      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      setEditOpen(false);
      setMessage({
        type: "success",
        text: "Profile updated successfully.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text: err.response?.data?.message || "Failed to update profile.",
      });
    }
  };

  const chooseImage = async () => {
    try {
      setMessage(null);

      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setMessage({
          type: "error",
          text: "Please allow gallery access to update your profile image.",
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.5,
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

      const imageData = `data:image/jpeg;base64,${asset.base64}`;

      await updateUserPhoto(user.id, imageData);

      const updatedUser = {
        ...user,
        profile_image: imageData,
      };

      setUser(updatedUser);
      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      setMessage({
        type: "success",
        text: "Profile image updated successfully.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        text:
          err.response?.data?.message ||
          "Failed to update profile image.",
      });
    }
  };

  const soon = (text) => {
    setOptionOpen(null);
    setSettingsOpen(false);
    setMessage({
      type: "success",
      text: `${text} will be added soon.`,
    });
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Profile" />

      <ScrollView
        contentContainerStyle={appStyles.pageContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={appStyles.hero}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 16 }}>
            <View style={appStyles.avatarCircle}>
              {profileImage ? (
                <Image
                  source={{ uri: profileImage }}
                  style={appStyles.avatarImage}
                />
              ) : (
                <Text style={appStyles.avatarText}>{firstLetter}</Text>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text style={appStyles.heroTitle}>{user.name || "User"}</Text>
              <Text style={appStyles.heroSubtitle}>
                {user.role || "user"}
              </Text>
            </View>
          </View>
        </View>

        {message ? (
          <View
            style={
              message.type === "error"
                ? appStyles.errorBox
                : appStyles.successBox
            }
          >
            <Text
              style={
                message.type === "error"
                  ? appStyles.errorText
                  : appStyles.successText
              }
            >
              {message.text}
            </Text>
          </View>
        ) : null}

        <View style={appStyles.card}>
          <View style={appStyles.between}>
            <Text style={appStyles.sectionTitle}>Profile Information</Text>

            <TouchableOpacity onPress={() => setSettingsOpen(true)}>
              <Text style={{ fontSize: 34 }}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <Text style={appStyles.text}>Email: {user.email || "-"}</Text>
          <Text style={appStyles.text}>Phone: {user.phone || "-"}</Text>
          <Text style={appStyles.text}>City: {user.city || "-"}</Text>
          <Text style={appStyles.text}>
            Birth Date: {user.dob ? String(user.dob).slice(0, 10) : "-"}
          </Text>

          <TouchableOpacity style={appStyles.secondaryBtn} onPress={chooseImage}>
            <Text style={appStyles.secondaryBtnText}>
              Update Profile Image
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal transparent visible={settingsOpen} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <Text style={appStyles.modalTitle}>Settings</Text>

            <TouchableOpacity
              style={appStyles.secondaryBtn}
              onPress={() => {
                setSettingsOpen(false);
                setEditOpen(true);
              }}
            >
              <Text style={appStyles.secondaryBtnText}>Edit Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={appStyles.secondaryBtn}
              onPress={() => setOptionOpen("language")}
            >
              <Text style={appStyles.secondaryBtnText}>Language</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={appStyles.secondaryBtn}
              onPress={() => setOptionOpen("theme")}
            >
              <Text style={appStyles.secondaryBtnText}>Theme</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={appStyles.primaryBtn}
              onPress={() => setSettingsOpen(false)}
            >
              <Text style={appStyles.primaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={editOpen} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <Text style={appStyles.modalTitle}>Edit Contact</Text>

            <Text style={appStyles.label}>Email</Text>
            <TextInput
              style={appStyles.input}
              value={form.email}
              onChangeText={(v) => setForm({ ...form, email: v })}
              placeholder="example@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <Text style={appStyles.label}>Phone</Text>
            <TextInput
              style={appStyles.input}
              value={form.phone}
              onChangeText={(v) => setForm({ ...form, phone: v })}
              placeholder="0776100522"
              keyboardType="phone-pad"
            />

            <Text style={appStyles.label}>City</Text>
            <TextInput
              style={appStyles.input}
              value={form.city}
              onChangeText={(v) => setForm({ ...form, city: v })}
              placeholder="Irbid"
            />

            <Text style={appStyles.label}>Birth Date</Text>
            <TextInput
              style={appStyles.input}
              value={form.dob}
              onChangeText={(v) => setForm({ ...form, dob: v })}
              placeholder="YYYY-MM-DD"
            />

            <TouchableOpacity style={appStyles.primaryBtn} onPress={saveContact}>
              <Text style={appStyles.primaryBtnText}>Save</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={appStyles.secondaryBtn}
              onPress={() => setEditOpen(false)}
            >
              <Text style={appStyles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={!!optionOpen} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <Text style={appStyles.modalTitle}>
              {optionOpen === "language" ? "Language" : "Theme"}
            </Text>

            {optionOpen === "language" ? (
              <>
                <TouchableOpacity
                  style={appStyles.secondaryBtn}
                  onPress={() => soon("English language")}
                >
                  <Text style={appStyles.secondaryBtnText}>English</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={appStyles.secondaryBtn}
                  onPress={() => soon("Arabic language")}
                >
                  <Text style={appStyles.secondaryBtnText}>Arabic</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity
                  style={appStyles.secondaryBtn}
                  onPress={() => soon("Light theme")}
                >
                  <Text style={appStyles.secondaryBtnText}>Light</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={appStyles.secondaryBtn}
                  onPress={() => soon("Dark theme")}
                >
                  <Text style={appStyles.secondaryBtnText}>Dark</Text>
                </TouchableOpacity>
              </>
            )}

            <TouchableOpacity
              style={appStyles.primaryBtn}
              onPress={() => setOptionOpen(null)}
            >
              <Text style={appStyles.primaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
};

export default UserProfile;