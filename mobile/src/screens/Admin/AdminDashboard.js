import React, { useCallback, useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Alert,
  Modal,
  Image,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import Header from "../../components/Common/Header";
import {
  getAdminUsers,
  createAdminUser,
  deleteAdminUser,
  getAdminTechnicians,
  createAdminTechnician,
  deleteAdminTechnician,
  getAdminStores,
  createAdminStore,
  deleteAdminStore,
  getAdminServices,
  createAdminService,
  deleteAdminService,
  getBackendImageUrl,
} from "../../services/adminService";

const JORDAN_CITIES = [
  "Amman",
  "Irbid",
  "Zarqa",
  "Balqa",
  "Madaba",
  "Karak",
  "Tafilah",
  "Maan",
  "Aqaba",
  "Jerash",
  "Ajloun",
  "Mafraq",
];

function formatDate(value) {
  if (!value) return "";
  return String(value).split("T")[0];
}

export default function AdminDashboard() {
  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    dob: "",
    city: "",
    password: "",
    service_id: "",
    experience: "",
    price_per_hour: "",
    store_name: "",
    category: "",
    address: "",
    owner_id: "",
    service_name: "",
    image_url: "",
  };

  const [view, setView] = useState("users");
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [stores, setStores] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => setForm(emptyForm);

  const loadServices = useCallback(async () => {
    try {
      const data = await getAdminServices();
      setServices(Array.isArray(data) ? data : []);
    } catch {
      setServices([]);
    }
  }, []);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);

      if (view === "users") setUsers(await getAdminUsers());
      if (view === "technicians") setTechnicians(await getAdminTechnicians());
      if (view === "stores") setStores(await getAdminStores());
      if (view === "services") setServices(await getAdminServices());
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const changeView = (nextView) => {
    setView(nextView);
    resetForm();
    setSelectedProfile(null);
  };

  const handleAdd = async () => {
    try {
      if (view === "users") {
        await createAdminUser({
          name: form.name,
          email: form.email,
          phone: form.phone,
          dob: form.dob,
          city: form.city,
          password: form.password,
          role: "user",
        });
      }

      if (view === "technicians") {
        await createAdminTechnician({
          name: form.name,
          email: form.email,
          phone: form.phone,
          dob: form.dob,
          city: form.city,
          password: form.password,
          service_id: form.service_id,
          experience: form.experience,
          price_per_hour: form.price_per_hour,
        });
      }

      if (view === "stores") {
        const categoryName =
          services.find((s) => String(s.id) === String(form.category))?.name ||
          form.category;

        await createAdminStore({
          store_name: form.store_name,
          category: categoryName,
          city: form.city,
          address: form.address,
          owner_id: form.owner_id || null,
        });
      }

      if (view === "services") {
        await createAdminService({
          name: form.service_name,
          image_url: form.image_url,
        });
      }

      resetForm();
      await loadData();
      await loadServices();
      Alert.alert("Success", "Added successfully.");
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (type, id) => {
    Alert.alert("Delete", "Are you sure?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            if (type === "user") await deleteAdminUser(id);
            if (type === "technician") await deleteAdminTechnician(id);
            if (type === "store") await deleteAdminStore(id);
            if (type === "service") await deleteAdminService(id);

            await loadData();
            await loadServices();
          } catch (err) {
            Alert.alert("Error", err?.response?.data?.message || err.message);
          }
        },
      },
    ]);
  };

  const renderInput = (label, key, placeholder, secure = false, keyboardType = "default") => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        value={form[key]}
        placeholder={placeholder}
        secureTextEntry={secure}
        keyboardType={keyboardType}
        onChangeText={(text) => setForm({ ...form, [key]: text })}
      />
    </View>
  );

  const renderPicker = (label, value, onChange, options, placeholder) => (
    <View style={styles.inputGroup}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.pickerBox}>
        <Picker selectedValue={value} onValueChange={onChange}>
          <Picker.Item label={placeholder} value="" />
          {options.map((item) => (
            <Picker.Item key={item.value} label={item.label} value={item.value} />
          ))}
        </Picker>
      </View>
    </View>
  );

  const serviceOptions = services.map((service) => ({
    label: service.name,
    value: String(service.id),
  }));

  const cityOptions = JORDAN_CITIES.map((city) => ({
    label: city,
    value: city,
  }));

  const renderRows = () => {
    const data =
      view === "users"
        ? users
        : view === "technicians"
        ? technicians
        : view === "stores"
        ? stores
        : services;

    if (!data.length) {
      return (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No data found.</Text>
        </View>
      );
    }

    return data.map((item) => {
      if (view === "users") {
        return (
          <View style={styles.itemCard} key={item.id}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemText}>Email: {item.email}</Text>
            <Text style={styles.itemText}>Phone: {item.phone || "-"}</Text>
            <Text style={styles.itemText}>Birth Date: {formatDate(item.dob) || "-"}</Text>
            <Text style={styles.itemText}>City: {item.city || "-"}</Text>
            <Text style={styles.itemText}>Role: {item.role}</Text>

            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.blackBtn} onPress={() => setSelectedProfile({ type: "user", data: item })}>
                <Text style={styles.blackBtnText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.outlineBtn} onPress={() => handleDelete("user", item.id)}>
                <Text style={styles.outlineBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }

      if (view === "technicians") {
        return (
          <View style={styles.itemCard} key={item.technicianId}>
            <Text style={styles.itemTitle}>{item.name}</Text>
            <Text style={styles.itemText}>Email: {item.email}</Text>
            <Text style={styles.itemText}>Phone: {item.phone || "-"}</Text>
            <Text style={styles.itemText}>Birth Date: {formatDate(item.dob) || "-"}</Text>
            <Text style={styles.itemText}>City: {item.city || "-"}</Text>
            <Text style={styles.itemText}>Service: {item.service || "-"}</Text>
            <Text style={styles.itemText}>Experience: {item.experience || 0} years</Text>
            <Text style={styles.itemText}>
              Price/hr: {Number(item.price_per_hour || 0).toFixed(2)} JOD
            </Text>

            <View style={styles.rowActions}>
              <TouchableOpacity style={styles.blackBtn} onPress={() => setSelectedProfile({ type: "technician", data: item })}>
                <Text style={styles.blackBtnText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.outlineBtn} onPress={() => handleDelete("technician", item.technicianId)}>
                <Text style={styles.outlineBtnText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        );
      }

      if (view === "stores") {
        return (
          <View style={styles.itemCard} key={item.id}>
            <Text style={styles.itemTitle}>{item.store_name}</Text>
            <Text style={styles.itemText}>Category: {item.category || "-"}</Text>
            <Text style={styles.itemText}>City: {item.city || "-"}</Text>
            <Text style={styles.itemText}>Address: {item.address || "-"}</Text>

            <TouchableOpacity style={styles.outlineBtn} onPress={() => handleDelete("store", item.id)}>
              <Text style={styles.outlineBtnText}>Delete</Text>
            </TouchableOpacity>
          </View>
        );
      }

      return (
        <View style={styles.itemCard} key={item.id}>
          {item.image_url ? (
            <Image source={{ uri: getBackendImageUrl(item.image_url) }} style={styles.serviceImage} />
          ) : null}
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemText}>{item.image_url || "-"}</Text>

          <TouchableOpacity style={styles.outlineBtn} onPress={() => handleDelete("service", item.id)}>
            <Text style={styles.outlineBtnText}>Delete</Text>
          </TouchableOpacity>
        </View>
      );
    });
  };

  return (
    <View style={styles.screen}>
      <Header />

      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Admin Dashboard</Text>

        <View style={styles.tabs}>
          {["users", "technicians", "stores", "services"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[styles.tabBtn, view === tab && styles.activeTab]}
              onPress={() => changeView(tab)}
            >
              <Text style={[styles.tabText, view === tab && styles.activeTabText]}>{tab}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {loading ? <Text style={styles.loading}>Loading...</Text> : null}

        {renderRows()}

        <View style={styles.formCard}>
          <Text style={styles.formTitle}>
            {view === "users"
              ? "Add User"
              : view === "technicians"
              ? "Add Technician"
              : view === "stores"
              ? "Add Store"
              : "Add Service"}
          </Text>

          {(view === "users" || view === "technicians") && (
            <>
              {renderInput("Name", "name", "Full name")}
              {renderInput("Email", "email", "Email")}
              {renderInput("Phone", "phone", "Phone")}
              {renderInput("Birth Date", "dob", "YYYY-MM-DD")}
              {renderPicker("City", form.city, (city) => setForm({ ...form, city }), cityOptions, "Select city")}
              {renderInput("Password", "password", "Password", true)}
            </>
          )}

          {view === "technicians" && (
            <>
              {renderPicker("Service", form.service_id, (service_id) => setForm({ ...form, service_id }), serviceOptions, "Select service")}
              {renderInput("Experience", "experience", "0", false, "numeric")}
              {renderInput("Price Per Hour", "price_per_hour", "0", false, "numeric")}
            </>
          )}

          {view === "stores" && (
            <>
              {renderInput("Store Name", "store_name", "Store name")}
              {renderPicker("Category", form.category, (category) => setForm({ ...form, category }), serviceOptions, "Select category")}
              {renderPicker("City", form.city, (city) => setForm({ ...form, city }), cityOptions, "Select city")}
              {renderInput("Address", "address", "Address")}
              {renderInput("Owner User ID", "owner_id", "Optional", false, "numeric")}
            </>
          )}

          {view === "services" && (
            <>
              {renderInput("Service Name", "service_name", "Service name")}
              {renderInput("Image URL", "image_url", "/images/services/name.png")}
            </>
          )}

          <TouchableOpacity style={styles.addBtn} onPress={handleAdd}>
            <Text style={styles.addBtnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={!!selectedProfile} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.profileModal}>
            <View style={styles.profileHeader}>
              <View>
                <Text style={styles.profileTitle}>
                  {selectedProfile?.type === "user" ? "User Profile" : "Technician Profile"}
                </Text>
                <Text style={styles.profileRole}>
                  {selectedProfile?.data?.role || selectedProfile?.type}
                </Text>
              </View>

              <TouchableOpacity style={styles.closeBtn} onPress={() => setSelectedProfile(null)}>
                <Text style={styles.closeBtnText}>Close</Text>
              </TouchableOpacity>
            </View>

            <ProfileItem label="Name" value={selectedProfile?.data?.name} />
            <ProfileItem label="Email" value={selectedProfile?.data?.email} />
            <ProfileItem label="Phone" value={selectedProfile?.data?.phone} />
            <ProfileItem label="Birth Date" value={formatDate(selectedProfile?.data?.dob)} />
            <ProfileItem label="City" value={selectedProfile?.data?.city} />

            {selectedProfile?.type === "technician" ? (
              <>
                <ProfileItem label="Service" value={selectedProfile?.data?.service} />
                <ProfileItem label="Experience" value={`${selectedProfile?.data?.experience || 0} years`} />
                <ProfileItem label="Price/hr" value={`${Number(selectedProfile?.data?.price_per_hour || 0).toFixed(2)} JOD`} />
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </View>
  );
}

function ProfileItem({ label, value }) {
  return (
    <View style={styles.profileItem}>
      <Text style={styles.profileItemLabel}>{label}</Text>
      <Text style={styles.profileItemValue}>{value || "-"}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#E8DCCF" },
  container: { padding: 18, paddingBottom: 70 },
  title: { fontSize: 40, fontWeight: "900", color: "#111", marginBottom: 18 },
  tabs: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 18 },
  tabBtn: {
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  activeTab: { backgroundColor: "#111" },
  tabText: { color: "#111", fontWeight: "800", textTransform: "capitalize" },
  activeTabText: { color: "#FFF9F3" },
  loading: { color: "#3A3028", marginBottom: 14, fontSize: 16 },
  itemCard: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  itemTitle: { fontSize: 26, fontWeight: "900", color: "#111", marginBottom: 8 },
  itemText: { fontSize: 16, color: "#3A3028", marginBottom: 6 },
  rowActions: { flexDirection: "row", gap: 10, marginTop: 12 },
  blackBtn: { backgroundColor: "#111", borderRadius: 999, paddingVertical: 11, paddingHorizontal: 20 },
  blackBtnText: { color: "#FFF9F3", fontWeight: "900" },
  outlineBtn: {
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 999,
    paddingVertical: 11,
    paddingHorizontal: 20,
    alignSelf: "flex-start",
    marginTop: 12,
  },
  outlineBtnText: { color: "#111", fontWeight: "900" },
  emptyCard: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 22,
    padding: 18,
    marginBottom: 16,
  },
  emptyText: { fontSize: 18, color: "#3A3028" },
  formCard: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 24,
    padding: 20,
    marginTop: 12,
  },
  formTitle: { fontSize: 26, fontWeight: "900", color: "#111", marginBottom: 16 },
  inputGroup: { marginBottom: 14 },
  label: { fontSize: 16, fontWeight: "900", color: "#111", marginBottom: 8 },
  input: {
    backgroundColor: "#F8F1E8",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#111",
  },
  pickerBox: {
    backgroundColor: "#F8F1E8",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 16,
    overflow: "hidden",
  },
  addBtn: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 15,
    paddingHorizontal: 30,
    alignSelf: "flex-start",
    marginTop: 8,
  },
  addBtnText: { color: "#FFF9F3", fontSize: 16, fontWeight: "900" },
  serviceImage: { width: 70, height: 70, borderRadius: 35, marginBottom: 10 },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(17,17,17,0.38)",
    paddingTop: 90,
    paddingHorizontal: 18,
  },
  profileModal: {
    backgroundColor: "#FFF9F3",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 26,
    padding: 22,
  },
  profileHeader: { flexDirection: "row", justifyContent: "space-between", gap: 12, marginBottom: 18 },
  profileTitle: { fontSize: 26, fontWeight: "900", color: "#111" },
  profileRole: { fontSize: 16, color: "#3A3028", textTransform: "capitalize", marginTop: 4 },
  closeBtn: {
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 999,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  closeBtnText: { fontWeight: "900", color: "#111" },
  profileItem: {
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
  },
  profileItemLabel: { color: "#111", fontWeight: "900", marginBottom: 6 },
  profileItemValue: { color: "#3A3028", fontSize: 16 },
});