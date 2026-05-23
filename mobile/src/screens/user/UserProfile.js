import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Pressable,
  Image,
  Alert,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

import Header from "../../components/Common/Header";
import API from "../../services/api";
import {
  getMyPaymentInfo,
  saveMyPaymentInfo,
  getMyBalance,
} from "../../services/paymentservice";

function formatDate(value) {
  if (!value) return "";
  return String(value).split("T")[0];
}

export default function UserProfile() {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);

  const [message, setMessage] = useState(null);

  const [photoPreview, setPhotoPreview] = useState("");

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [dob, setDob] = useState("");

  const [paymentInfo, setPaymentInfo] = useState({
    account_holder: "",
    wallet_name: "",
    wallet_number: "",
    mock_account_number: "",
  });

  const isTechnician =
    String(profile?.role || "").toLowerCase() === "technician";

  const loadUser = async () => {
    const raw = await AsyncStorage.getItem("user");
    const saved = raw ? JSON.parse(raw) : null;
    setCurrentUser(saved);
    return saved;
  };

  const loadProfile = async () => {
    try {
      const savedUser = currentUser || (await loadUser());

      if (!savedUser?.id) {
        setMessage({
          type: "error",
          title: "Error",
          body: "User id is missing.",
        });
        return;
      }

      const res = await API.get(`/users/${savedUser.id}`);
      const data = res.data || {};

      setProfile(data);
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setCity(data.city || "");
      setDob(formatDate(data.dob));

      const savedPhoto = await AsyncStorage.getItem(
        `profile_photo_${savedUser.id}`
      );
      if (savedPhoto) setPhotoPreview(savedPhoto);
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to load profile.",
      });
    }
  };

  const loadPaymentInfo = async () => {
    try {
      const data = await getMyPaymentInfo();

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

  useEffect(() => {
    loadProfile();
  }, []);

  const showSoon = (title) => {
    setMenuOpen(false);
    setMessage({
      type: "warning",
      title,
      body: "We will add this feature soon.",
    });
  };

  const saveProfile = async () => {
    try {
      if (!currentUser?.id) return;

      const payload = { email, phone, city, dob };

      await API.patch(`/users/${currentUser.id}`, payload);

      try {
        await API.post("/users/send-profile-update-email", {
          userId: currentUser.id,
          ...payload,
        });
      } catch {}

      const updatedUser = {
        ...currentUser,
        email,
        phone,
        city,
        dob,
      };

      await AsyncStorage.setItem("user", JSON.stringify(updatedUser));

      setCurrentUser(updatedUser);
      setProfile((prev) => ({ ...prev, ...payload }));
      setEditOpen(false);

      setMessage({
        type: "success",
        title: "Saved Successfully",
        body: "Profile updated successfully and we sent an email.",
      });
    } catch (err) {
      setMessage({
        type: "error",
        title: "Error",
        body: err?.response?.data?.message || "Failed to update profile.",
      });
    }
  };

  const pickPhoto = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert("Permission Required", "Please allow image access.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true,
        quality: 0.7,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.uri) return;

      await AsyncStorage.setItem(`profile_photo_${currentUser.id}`, asset.uri);
      setPhotoPreview(asset.uri);

      setMenuOpen(false);

      setMessage({
        type: "success",
        title: "Saved Successfully",
        body: "Profile photo updated successfully.",
      });
    } catch {
      Alert.alert("Error", "Failed to update photo.");
    }
  };

  const openPaymentInfo = async () => {
    setMenuOpen(false);
    await loadPaymentInfo();
    setPaymentOpen(true);
  };

  const savePayment = async () => {
    try {
      await saveMyPaymentInfo(paymentInfo);

      setPaymentOpen(false);

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

  const showBalance = async () => {
    try {
      setMenuOpen(false);

      const data = await getMyBalance();
      const info = data.paymentInfo;

      setMessage({
        type: "success",
        title: "My Balance",
        body: `Total earnings: ${Number(data.totalEarnings || 0).toFixed(
          2
        )} JOD\nPayments: ${data.totalPayments || 0}\nWallet: ${
          info?.wallet_name || "-"
        }\nWallet number: ${info?.wallet_number || "-"}`,
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
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.profileCard}>
          <View style={styles.topRow}>
            <View style={styles.identity}>
              <View style={styles.avatar}>
                {photoPreview ? (
                  <Image source={{ uri: photoPreview }} style={styles.avatarImg} />
                ) : (
                  <Text style={styles.avatarText}>
                    {(profile?.name || "?").charAt(0).toUpperCase()}
                  </Text>
                )}
              </View>

              <View>
                <Text style={styles.name}>{profile?.name || "-"}</Text>
                <Text style={styles.role}>{profile?.role || "-"}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={() => setMenuOpen(true)}
            >
              <Text style={styles.settingsText}>⚙️</Text>
            </TouchableOpacity>
          </View>

          {message ? (
            <View
              style={[
                styles.messageBox,
                message.type === "error" && styles.errorBox,
                message.type === "success" && styles.successBox,
                message.type === "warning" && styles.warningBox,
              ]}
            >
              <Text style={styles.messageTitle}>{message.title}</Text>
              <Text style={styles.messageBody}>{message.body}</Text>
            </View>
          ) : null}

          <View style={styles.infoBox}>
            <Text style={styles.info}>
              <Text style={styles.bold}>Email:</Text> {profile?.email || "-"}
            </Text>
            <Text style={styles.info}>
              <Text style={styles.bold}>Phone:</Text> {profile?.phone || "-"}
            </Text>
            <Text style={styles.info}>
              <Text style={styles.bold}>City:</Text> {profile?.city || "-"}
            </Text>
            <Text style={styles.info}>
              <Text style={styles.bold}>Birth Date:</Text>{" "}
              {formatDate(profile?.dob) || "-"}
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal transparent visible={menuOpen} animationType="fade">
        <Pressable style={styles.overlay} onPress={() => setMenuOpen(false)}>
          <Pressable style={styles.menuBox}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => {
                setMenuOpen(false);
                setEditOpen(true);
              }}
            >
              <Text style={styles.menuText}>Edit Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.menuItem} onPress={pickPhoto}>
              <Text style={styles.menuText}>Edit Photo</Text>
            </TouchableOpacity>

            {isTechnician ? (
              <>
                <TouchableOpacity style={styles.menuItem} onPress={openPaymentInfo}>
                  <Text style={styles.menuText}>Payment Info</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem} onPress={showBalance}>
                  <Text style={styles.menuText}>My Balance</Text>
                </TouchableOpacity>
              </>
            ) : null}

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => showSoon("Language")}
            >
              <Text style={styles.menuText}>Language ›</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => showSoon("Theme")}
            >
              <Text style={styles.menuText}>Theme ›</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>

      <Modal transparent visible={editOpen} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Edit Contact</Text>

            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} />

            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} />

            <Text style={styles.label}>City</Text>
            <TextInput style={styles.input} value={city} onChangeText={setCity} />

            <Text style={styles.label}>Birth Date</Text>
            <TextInput
              style={styles.input}
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={saveProfile}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setEditOpen(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={paymentOpen} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Mock Payment Info</Text>

            <Text style={styles.label}>Account Holder</Text>
            <TextInput
              style={styles.input}
              value={paymentInfo.account_holder}
              onChangeText={(v) =>
                setPaymentInfo({ ...paymentInfo, account_holder: v })
              }
            />

            <Text style={styles.label}>Wallet Name</Text>
            <TextInput
              style={styles.input}
              value={paymentInfo.wallet_name}
              onChangeText={(v) =>
                setPaymentInfo({ ...paymentInfo, wallet_name: v })
              }
              placeholder="CliQ / Zain Cash"
            />

            <Text style={styles.label}>Wallet Number</Text>
            <TextInput
              style={styles.input}
              value={paymentInfo.wallet_number}
              onChangeText={(v) =>
                setPaymentInfo({ ...paymentInfo, wallet_number: v })
              }
            />

            <Text style={styles.label}>Mock Account Number</Text>
            <TextInput
              style={styles.input}
              value={paymentInfo.mock_account_number}
              onChangeText={(v) =>
                setPaymentInfo({ ...paymentInfo, mock_account_number: v })
              }
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.saveBtn} onPress={savePayment}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setPaymentOpen(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
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
  container: { padding: 18, paddingTop: 70 },
  profileCard: {
    backgroundColor: "#FFF9F3",
    borderRadius: 28,
    padding: 24,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 26,
  },
  identity: { flexDirection: "row", alignItems: "center", gap: 18, flex: 1 },
  avatar: {
    width: 86,
    height: 86,
    borderRadius: 43,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  avatarImg: { width: "100%", height: "100%" },
  avatarText: { color: "#FFF", fontSize: 44, fontWeight: "900" },
  name: { fontSize: 36, fontWeight: "900", color: "#111" },
  role: {
    backgroundColor: "#EFE4D8",
    alignSelf: "flex-start",
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 999,
    fontSize: 18,
    fontWeight: "900",
    textTransform: "capitalize",
    marginTop: 8,
  },
  settingsBtn: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#EFE4D8",
    justifyContent: "center",
    alignItems: "center",
  },
  settingsText: { fontSize: 30 },
  infoBox: { gap: 22 },
  info: { fontSize: 24, color: "#3A3028", lineHeight: 34 },
  bold: { fontWeight: "900", color: "#111" },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: 190,
    paddingRight: 35,
  },
  menuBox: {
    width: 260,
    backgroundColor: "#FFF9F3",
    borderRadius: 24,
    padding: 14,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  menuItem: { padding: 18, borderRadius: 16 },
  menuText: { fontSize: 22, color: "#111" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    padding: 20,
  },
  modal: {
    backgroundColor: "#FFF9F3",
    borderRadius: 28,
    padding: 22,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  modalTitle: { fontSize: 32, fontWeight: "900", marginBottom: 24 },
  label: { fontSize: 18, fontWeight: "900", marginBottom: 8 },
  input: {
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 16,
    padding: 14,
    fontSize: 18,
    marginBottom: 16,
  },
  modalActions: { flexDirection: "row", gap: 12, marginTop: 8 },
  saveBtn: {
    backgroundColor: "#111",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  saveText: { color: "#FFF", fontSize: 18, fontWeight: "900" },
  cancelBtn: {
    borderWidth: 1,
    borderColor: "#111",
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 999,
  },
  cancelText: { color: "#111", fontSize: 18, fontWeight: "900" },
  messageBox: {
    borderRadius: 16,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
  },
  successBox: { backgroundColor: "#F5FBF6", borderColor: "#CFE8D4" },
  errorBox: { backgroundColor: "#FFF3F3", borderColor: "#EFC3C3" },
  warningBox: { backgroundColor: "#FFF8EF", borderColor: "#EFD7AB" },
  messageTitle: { fontWeight: "900", fontSize: 17, marginBottom: 5 },
  messageBody: { fontSize: 15, color: "#3A3028", lineHeight: 22 },
});