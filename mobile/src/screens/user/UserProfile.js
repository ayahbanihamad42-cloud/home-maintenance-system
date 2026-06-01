import React, { useEffect, useState } from "react";
import { SafeAreaView, ScrollView, View, Text, TouchableOpacity, Modal, TextInput } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import API from "../../services/api";
import appStyles from "../../styles/mobileStyles";

const UserProfile = ({ navigation }) => {
  const [user, setUser] = useState({});
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [form, setForm] = useState({ name: "", email: "", phone: "", city: "", dob: "" });

  useEffect(() => {
    const load = async () => {
      const raw = await AsyncStorage.getItem("user");
      const u = raw ? JSON.parse(raw) : {};
      setUser(u);
      setForm({
        name: u.name || "",
        email: u.email || "",
        phone: u.phone || "",
        city: u.city || "",
        dob: u.dob ? String(u.dob).slice(0, 10) : "",
      });
    };
    load();
  }, []);

  const save = async () => {
    try {
      await API.patch(`/users/${user.id}`, form);
      const updated = { ...user, ...form };
      setUser(updated);
      await AsyncStorage.setItem("user", JSON.stringify(updated));
      setEditOpen(false);
      setMessage("Profile updated successfully.");
    } catch {
      setMessage("Failed to update profile.");
    }
  };

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title="Profile" />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <View style={appStyles.hero}>
          <Text style={appStyles.heroTitle}>{user.name || "User"}</Text>
          <Text style={appStyles.heroSubtitle}>{user.role || "user"}</Text>
        </View>

        {message ? (
          <View style={message.includes("Failed") ? appStyles.errorBox : appStyles.successBox}>
            <Text style={message.includes("Failed") ? appStyles.errorText : appStyles.successText}>{message}</Text>
          </View>
        ) : null}

        <View style={appStyles.card}>
          <View style={appStyles.between}>
            <Text style={appStyles.sectionTitle}>Profile Information</Text>
            <TouchableOpacity onPress={() => setSettingsOpen(true)}>
              <Text style={{ fontSize: 26 }}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <Text style={appStyles.text}>Email: {user.email || "-"}</Text>
          <Text style={appStyles.text}>Phone: {user.phone || "-"}</Text>
          <Text style={appStyles.text}>City: {user.city || "-"}</Text>
          <Text style={appStyles.text}>Birth Date: {user.dob ? String(user.dob).slice(0, 10) : "-"}</Text>
        </View>
      </ScrollView>

      <Modal transparent visible={settingsOpen} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <Text style={appStyles.sectionTitle}>Settings</Text>

            <TouchableOpacity style={appStyles.secondaryBtn} onPress={() => { setSettingsOpen(false); setEditOpen(true); }}>
              <Text style={appStyles.secondaryBtnText}>Edit Contact</Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.secondaryBtn} onPress={() => setMessage("Language will be added soon.")}>
              <Text style={appStyles.secondaryBtnText}>Language</Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.secondaryBtn} onPress={() => setMessage("Theme will be added soon.")}>
              <Text style={appStyles.secondaryBtnText}>Theme</Text>
            </TouchableOpacity>

            <TouchableOpacity style={appStyles.primaryBtn} onPress={() => setSettingsOpen(false)}>
              <Text style={appStyles.primaryBtnText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={editOpen} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <Text style={appStyles.sectionTitle}>Edit Contact</Text>

            {["name", "email", "phone", "city", "dob"].map((key) => (
              <View key={key}>
                <Text style={appStyles.label}>{key}</Text>
                <TextInput
                  style={appStyles.input}
                  value={form[key]}
                  onChangeText={(v) => setForm({ ...form, [key]: v })}
                />
              </View>
            ))}

            <TouchableOpacity style={appStyles.primaryBtn} onPress={save}>
              <Text style={appStyles.primaryBtnText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
};

export default UserProfile;