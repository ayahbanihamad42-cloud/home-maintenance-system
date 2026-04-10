import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getToken } from "../../services/auth.service.jsx";
import Header from "../../components/common/Header";
import axios from "axios";

import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  Modal,
  Alert,
  ScrollView,
} from "react-native";

/* --- helper صغير لعرض سطرين معلومات داخل المودال --- */
function InfoRow({ label, value }) {
  return (
    <View style={styles.infoRow}>
      <Text style={styles.infoLabel}>{label}:</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
  );
}

function AdminDashboard() {
  const [view, setView] = useState("users");
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    service: "",
    experience: "",
  });

  const serviceOptions = ["Plumbing", "Electrical", "Painting", "Decoration"];

  const API = useMemo(
    () =>
      axios.create({
        baseURL: "http://localhost:5000/api",
        headers: { Authorization: `Bearer ${getToken()}` },
      }),
    []
  );

  const fetchData = useCallback(async () => {
    try {
      if (view === "users") {
        const res = await API.get("/admin/users");
        setUsers(res.data);
      } else {
        const res = await API.get("/admin/technicians");
        setTechnicians(res.data);
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || error.message);
    }
  }, [API, view]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteUser = async (userId) => {
    Alert.alert("Confirm", "Are you sure you want to delete this user?", [
      { text: "Cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            await API.delete(`/admin/users/${userId}`);
            setSelectedProfile(null);
            fetchData();
          } catch (error) {
            Alert.alert("Error", error.response?.data?.message || error.message);
          }
        },
      },
    ]);
  };

  const handleDeleteTechnician = async (technicianId) => {
    Alert.alert("Confirm", "Are you sure you want to delete this technician?", [
      { text: "Cancel" },
      {
        text: "OK",
        onPress: async () => {
          try {
            await API.delete(`/admin/technicians/${technicianId}`);
            setSelectedProfile(null);
            fetchData();
          } catch (error) {
            Alert.alert("Error", error.response?.data?.message || error.message);
          }
        },
      },
    ]);
  };

  return (
    <>
      <Header />

      <ScrollView style={styles.container}>
        <Text style={styles.title}>Admin Dashboard</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => setView("users")}>
            <Text style={styles.btnText}>Manage Users</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setView("technicians")}>
            <Text style={styles.btnText}>Manage Technicians</Text>
          </TouchableOpacity>
        </View>

        {/* USERS */}
        {view === "users" ? (
          <FlatList
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={({ item: u }) => (
              <View style={styles.card}>
                <Text>{u.name}</Text>
                <Text>{u.email}</Text>
                <Text>{u.phone}</Text>
                <Text>{u.city}</Text>

                <TouchableOpacity
                  onPress={() => setSelectedProfile({ type: "user", data: u })}
                >
                  <Text style={styles.link}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => handleDeleteUser(u.id)}>
                  <Text style={styles.link}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        ) : (
          <FlatList
            data={technicians}
            keyExtractor={(item) => item.technicianId.toString()}
            renderItem={({ item: t }) => (
              <View style={styles.card}>
                <Text>{t.name}</Text>
                <Text>{t.email}</Text>
                <Text>{t.phone}</Text>
                <Text>{t.city}</Text>
                <Text>{t.service}</Text>
                <Text>{t.experience} yrs</Text>

                <TouchableOpacity
                  onPress={() => setSelectedProfile({ type: "technician", data: t })}
                >
                  <Text style={styles.link}>View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => handleDeleteTechnician(t.technicianId)}
                >
                  <Text style={styles.link}>Delete</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}

        {/* FORM */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>
            Add {view === "users" ? "User" : "Technician"}
          </Text>

          <TextInput
            style={styles.input}
            value={form.name}
            placeholder="Full name"
            onChangeText={(text) => setForm({ ...form, name: text })}
          />

          <TextInput
            style={styles.input}
            value={form.email}
            placeholder="Email"
            onChangeText={(text) => setForm({ ...form, email: text })}
          />

          <TextInput
            style={styles.input}
            value={form.phone}
            placeholder="Phone"
            onChangeText={(text) => setForm({ ...form, phone: text })}
          />

          <TextInput
            style={styles.input}
            value={form.city}
            placeholder="City"
            onChangeText={(text) => setForm({ ...form, city: text })}
          />

          <TextInput
            style={styles.input}
            value={form.password}
            placeholder="Password"
            secureTextEntry
            onChangeText={(text) => setForm({ ...form, password: text })}
          />

          {view === "technicians" ? (
            <>
              <TextInput
                style={styles.input}
                value={form.service}
                placeholder="Service"
                onChangeText={(text) => setForm({ ...form, service: text })}
              />

              <TextInput
                style={styles.input}
                value={form.experience}
                placeholder="Experience"
                onChangeText={(text) => setForm({ ...form, experience: text })}
              />
            </>
          ) : null}

          <TouchableOpacity
            style={styles.primaryBtn}
            onPress={async () => {
              try {
                if (view === "users") {
                  await API.post("/admin/users", {
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    city: form.city,
                    password: form.password,
                  });
                  setView("users");
                  fetchData();
                } else {
                  await API.post("/admin/technicians", {
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    city: form.city,
                    password: form.password,
                    service: form.service,
                    experience: form.experience,
                  });
                  setView("technicians");
                  fetchData();
                }

                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  city: "",
                  password: "",
                  service: "",
                  experience: "",
                });

                Alert.alert(
                  "Success",
                  `${view === "users" ? "User" : "Technician"} added successfully.`
                );
              } catch (error) {
                Alert.alert("Error", error.response?.data?.message || error.message);
              }
            }}
          >
            <Text style={styles.btnText}>
              Add {view === "users" ? "User" : "Technician"}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* MODAL */}
      <Modal visible={!!selectedProfile} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selectedProfile && (
              <>
                <Text style={styles.modalTitle}>
                  {selectedProfile.type === "user"
                    ? "User Profile"
                    : "Technician Profile"}
                </Text>

                <InfoRow label="Email" value={selectedProfile.data.email} />
                <InfoRow label="Phone" value={selectedProfile.data.phone || "-"} />
                <InfoRow label="City" value={selectedProfile.data.city || "-"} />

                {selectedProfile.type === "technician" ? (
                  <>
                    <InfoRow label="Service" value={selectedProfile.data.service} />
                    <InfoRow
                      label="Experience"
                      value={`${selectedProfile.data.experience} yrs`}
                    />
                  </>
                ) : null}

                <TouchableOpacity
                  onPress={() => setSelectedProfile(null)}
                >
                  <Text style={styles.link}>Close</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  buttonRow: { flexDirection: "row", gap: 10, marginBottom: 15 },
  primaryBtn: { backgroundColor: "#007BFF", padding: 10, borderRadius: 5 },
  secondaryBtn: { backgroundColor: "#6c757d", padding: 10, borderRadius: 5 },
  btnText: { color: "#fff", textAlign: "center" },
  card: { padding: 10, backgroundColor: "#fff", marginBottom: 10 },
  link: { color: "blue", marginTop: 5 },
  form: { marginTop: 20 },
  sectionTitle: { fontWeight: "bold", marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 10,
    width: "80%",
  },
  modalTitle: { fontWeight: "bold", marginBottom: 10 },
  infoRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 5 },
  infoLabel: { fontWeight: "bold" },
  infoValue: {},
});

export default AdminDashboard;