import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  Image,
  TextInput,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
import API from "../../services/api";
import Header from "../../components/Common/Header";
import { updateTechnicianPrice } from "../../services/technicianService";
import appStyles from "../../styles/mobileStyles";

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPriceModal, setShowPriceModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pricePerHour, setPricePerHour] = useState("");
  const [message, setMessage] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (!userData) return;

      const user = JSON.parse(userData);

      API.get(`/users/${user.id}`).then(async (res) => {
        setProfile(res.data);
        setEmail(res.data.email || "");
        setPhone(res.data.phone || "");

        const savedPhoto = await AsyncStorage.getItem(`profile_photo_${user.id}`);
        if (savedPhoto) setAvatarPreview(savedPhoto);

        if (res.data.role === "technician") {
          API.get(`/technicians/user/${user.id}`)
            .then((techRes) => {
              setPricePerHour(
                techRes.data?.price_per_hour !== undefined
                  ? String(techRes.data.price_per_hour)
                  : ""
              );
            })
            .catch(() => {});
        }
      });
    };

    loadData();
  }, []);

  const showMessage = (type, title, body) => {
    setMessage({ type, title, body });
    setTimeout(() => setMessage(null), 2500);
  };

  if (!profile) {
    return (
      <View style={appStyles.loader}>
        <ActivityIndicator size="large" color="#111111" />
      </View>
    );
  }

  const isTechnician = profile.role === "technician";

  const submitProfileUpdate = async () => {
    if (!email) {
      showMessage("warning", "Notice", "Email is required.");
      return;
    }

    try {
      await API.patch(`/users/${profile.id}`, { email, phone });

      try {
        await API.post(`/users/${profile.id}/send-verification`, { email });
      } catch (err) {}

      setProfile((prev) => ({ ...prev, email, phone }));
      showMessage("success", "Saved Successfully", "Save success. Review email.");
      setShowEditModal(false);
    } catch (error) {
      showMessage(
        "error",
        "Notice",
        error.response?.data?.message || "Failed to update profile."
      );
    }
  };

  const submitPriceUpdate = async () => {
    if (pricePerHour === "" || Number(pricePerHour) < 0) {
      showMessage("warning", "Notice", "Please enter a valid price.");
      return;
    }

    try {
      await updateTechnicianPrice(Number(pricePerHour));

      try {
        await API.post(`/users/${profile.id}/send-verification`, {
          email: profile.email,
        });
      } catch (err) {}

      showMessage("success", "Saved Successfully", "Save success. Review email.");
      setShowPriceModal(false);
    } catch (error) {
      showMessage(
        "error",
        "Notice",
        error.response?.data?.message || "Failed to update price."
      );
    }
  };

  const pickPhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.6,
      allowsEditing: true,
      aspect: [1, 1],
      base64: true,
    });

    if (!result.canceled) {
      const uri = `data:image/jpeg;base64,${result.assets[0].base64}`;
      setAvatarPreview(uri);
      await AsyncStorage.setItem(`profile_photo_${profile.id}`, uri);

      try {
        await API.post(`/users/${profile.id}/send-verification`, {
          email: profile.email,
        });
      } catch (err) {}

      showMessage("success", "Saved Successfully", "Save success. Review email.");
      setShowPhotoModal(false);
    }
  };

  return (
    <SafeAreaView style={appStyles.screen}>
      <Header />

      <ScrollView contentContainerStyle={appStyles.content}>
        <View style={appStyles.card}>
          <View style={appStyles.profileHeader}>
            <View style={appStyles.profileIdentity}>
              <View style={appStyles.avatar}>
                {avatarPreview ? (
                  <Image source={{ uri: avatarPreview }} style={appStyles.avatarImage} />
                ) : (
                  <Text style={appStyles.avatarText}>{profile.name.charAt(0)}</Text>
                )}
              </View>

              <View>
                <Text style={appStyles.userName}>{profile.name}</Text>
                <View style={appStyles.roleBadge}>
                  <Text style={appStyles.roleText}>{profile.role}</Text>
                </View>
              </View>
            </View>

            <TouchableOpacity
              style={appStyles.iconCircle}
              onPress={() => setShowSettingsModal(true)}
            >
              <Text style={appStyles.iconText}>⚙</Text>
            </TouchableOpacity>
          </View>

          {message ? (
            <View style={[appStyles.messageCard, appStyles[`${message.type}Card`]]}>
              <Text style={appStyles.messageTitle}>{message.title}</Text>
              <Text style={appStyles.messageBody}>{message.body}</Text>
            </View>
          ) : null}

          <Text style={appStyles.infoRow}>
            <Text style={appStyles.bold}>Email:</Text> {profile.email}
          </Text>
          <Text style={appStyles.infoRow}>
            <Text style={appStyles.bold}>Phone:</Text> {profile.phone || "Not set"}
          </Text>
          <Text style={appStyles.infoRow}>
            <Text style={appStyles.bold}>City:</Text> {profile.city}
          </Text>
          <Text style={appStyles.infoRow}>
            <Text style={appStyles.bold}>Birth Date:</Text>{" "}
            {new Date(profile.dob).toLocaleDateString()}
          </Text>

          {isTechnician ? (
            <Text style={appStyles.infoRow}>
              <Text style={appStyles.bold}>Price per Hour:</Text> {pricePerHour || "Not set"} JOD
            </Text>
          ) : null}
        </View>
      </ScrollView>

      <Modal visible={showSettingsModal} transparent animationType="fade">
        <TouchableOpacity
          style={appStyles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowSettingsModal(false)}
        >
          <View style={appStyles.menuCard}>
            <Text style={appStyles.dropdownTitle}>Settings</Text>

            <TouchableOpacity
              style={appStyles.menuItem}
              onPress={() => {
                setShowSettingsModal(false);
                setShowEditModal(true);
              }}
            >
              <Text style={appStyles.menuItemText}>Edit Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={appStyles.menuItem}
              onPress={() => {
                setShowSettingsModal(false);
                setShowPhotoModal(true);
              }}
            >
              <Text style={appStyles.menuItemText}>Edit Photo</Text>
            </TouchableOpacity>

            {isTechnician ? (
              <TouchableOpacity
                style={appStyles.menuItem}
                onPress={() => {
                  setShowSettingsModal(false);
                  setShowPriceModal(true);
                }}
              >
                <Text style={appStyles.menuItemText}>Edit Price</Text>
              </TouchableOpacity>
            ) : null}

            <TouchableOpacity
              style={appStyles.menuItem}
              onPress={() => {
                setShowSettingsModal(false);
                showMessage("warning", "Notice", "Language setting will be added here.");
              }}
            >
              <Text style={appStyles.menuItemText}>Language</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={appStyles.menuItem}
              onPress={() => {
                setShowSettingsModal(false);
                showMessage("warning", "Notice", "Theme setting will be added here.");
              }}
            >
              <Text style={appStyles.menuItemText}>Theme</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>

      <Modal visible={showEditModal} transparent animationType="slide">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalCard}>
            <Text style={appStyles.modalTitle}>Update Contact</Text>

            <Text style={appStyles.label}>Email</Text>
            <TextInput style={appStyles.input} value={email} onChangeText={setEmail} />

            <Text style={appStyles.label}>Phone</Text>
            <TextInput style={appStyles.input} value={phone} onChangeText={setPhone} />

            <View style={appStyles.modalActionsRow}>
              <TouchableOpacity
                style={[appStyles.secondaryBtn, { flex: 1 }]}
                onPress={() => setShowEditModal(false)}
              >
                <Text style={appStyles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[appStyles.primaryBtn, { flex: 1 }]}
                onPress={submitProfileUpdate}
              >
                <Text style={appStyles.primaryBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPriceModal} transparent animationType="slide">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalCard}>
            <Text style={appStyles.modalTitle}>Update Price</Text>

            <Text style={appStyles.label}>Price per Hour</Text>
            <TextInput
              style={appStyles.input}
              value={pricePerHour}
              onChangeText={setPricePerHour}
              keyboardType="numeric"
            />

            <View style={appStyles.modalActionsRow}>
              <TouchableOpacity
                style={[appStyles.secondaryBtn, { flex: 1 }]}
                onPress={() => setShowPriceModal(false)}
              >
                <Text style={appStyles.secondaryBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[appStyles.primaryBtn, { flex: 1 }]}
                onPress={submitPriceUpdate}
              >
                <Text style={appStyles.primaryBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={showPhotoModal} transparent animationType="slide">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalCard}>
            <Text style={appStyles.modalTitle}>Update Profile Photo</Text>

            {avatarPreview ? (
              <View style={appStyles.photoPreviewWrap}>
                <Image source={{ uri: avatarPreview }} style={appStyles.photoPreview} />
              </View>
            ) : null}

            <TouchableOpacity style={appStyles.primaryBtn} onPress={pickPhoto}>
              <Text style={appStyles.primaryBtnText}>Choose Photo</Text>
            </TouchableOpacity>

            <View style={appStyles.modalActionsRow}>
              <TouchableOpacity
                style={[appStyles.secondaryBtn, { flex: 1 }]}
                onPress={() => setShowPhotoModal(false)}
              >
                <Text style={appStyles.secondaryBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

export default UserProfile;
