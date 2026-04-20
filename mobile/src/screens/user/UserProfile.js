import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  Modal, 
  ActivityIndicator, 
  SafeAreaView,
  ScrollView,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import API from "../../services/api";
import Header from "../../components/common/Header";

function UserProfile() {
  const [profile, setProfile] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [editMessage, setEditMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      const userData = await AsyncStorage.getItem("user");
      if (userData) {
        const user = JSON.parse(userData);
        API.get(`/users/${user.id}`).then(res => {
          setProfile(res.data);
          setEmail(res.data.email || "");
          setPhone(res.data.phone || "");
        });
      }
    };
    loadData();
  }, []);

  if (!profile) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  const resetEditForm = () => {
    setEmail(profile?.email || "");
    setPhone(profile?.phone || "");
    setEditMessage("");
  };

  const submitProfileUpdate = async () => {
    if (!email) {
      setEditMessage("Email is required.");
      return;
    }
    try {
      await API.patch(`/users/${profile.id}`, { email, phone });
      
      try {
        await API.post(`/users/${profile.id}/send-verification`, { email });
      } catch (err) {
        console.error("Verification email service error");
      }

      setEditMessage("Profile updated! Please check your email to confirm changes.");
      setProfile((prev) => ({ ...prev, email, phone }));

      setTimeout(() => {
        setShowEditModal(false);
        resetEditForm();
      }, 2500);
    } catch (error) {
      setEditMessage(error.response?.data?.message || "Failed to update profile.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileCard}>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{profile.name.charAt(0)}</Text>
            </View>
            <Text style={styles.userName}>{profile.name}</Text>
            <View style={styles.roleBadge}>
              <Text style={styles.roleText}>{profile.role}</Text>
            </View>
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.infoRow}><Text style={styles.bold}>Email:</Text> {profile.email}</Text>
            <Text style={styles.infoRow}><Text style={styles.bold}>Phone:</Text> {profile.phone || "Not set"}</Text>
            <Text style={styles.infoRow}><Text style={styles.bold}>City:</Text> {profile.city}</Text>
            <Text style={styles.infoRow}><Text style={styles.bold}>Birth Date:</Text> {new Date(profile.dob).toLocaleDateString()}</Text>
          </View>

          <TouchableOpacity style={styles.editBtn} onPress={() => { resetEditForm(); setShowEditModal(true); }}>
            <Text style={styles.editBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showEditModal} transparent animationType="slide" onRequestClose={() => setShowEditModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Update Profile</Text>
            
            <Text style={styles.label}>Email</Text>
            <TextInput style={styles.input} value={email} onChangeText={setEmail} keyboardType="email-address" />

            <Text style={styles.label}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />

            {editMessage ? <Text style={styles.helperText}>{editMessage}</Text> : null}

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.secondaryBtn} onPress={() => setShowEditModal(false)}>
                <Text style={styles.btnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.primaryBtn} onPress={submitProfileUpdate}>
                <Text style={styles.primaryBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  scrollContent: { padding: 20 },
  profileCard: { backgroundColor: "#fff", borderRadius: 15, padding: 20, elevation: 4, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8 },
  profileHeader: { alignItems: "center", marginBottom: 20 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#007AFF", justifyContent: "center", alignItems: "center", marginBottom: 10 },
  avatarText: { color: "#fff", fontSize: 32, fontWeight: "bold" },
  userName: { fontSize: 22, fontWeight: "bold", color: "#333" },
  roleBadge: { backgroundColor: "#e1f5fe", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20, marginTop: 5 },
  roleText: { color: "#0288d1", fontSize: 12, fontWeight: "bold" },
  profileInfo: { marginBottom: 25 },
  infoRow: { fontSize: 16, marginBottom: 12, color: "#555" },
  bold: { fontWeight: "bold", color: "#333" },
  editBtn: { backgroundColor: "#007AFF", padding: 15, borderRadius: 10, alignItems: "center" },
  editBtnText: { color: "#fff", fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
  modal: { backgroundColor: "#fff", borderRadius: 15, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 15, textAlign: "center" },
  label: { fontSize: 14, color: "#666", marginBottom: 5 },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 10, marginBottom: 15 },
  helperText: { color: "#007AFF", textAlign: "center", marginBottom: 10 },
  modalActions: { flexDirection: "row", justifyContent: "space-between" },
  primaryBtn: { backgroundColor: "#007AFF", padding: 12, borderRadius: 8, flex: 0.48, alignItems: "center" },
  primaryBtnText: { color: "#fff", fontWeight: "bold" },
  secondaryBtn: { backgroundColor: "#eee", padding: 12, borderRadius: 8, flex: 0.48, alignItems: "center" },
  btnText: { color: "#333" }
});

export default UserProfile;

