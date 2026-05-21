import React, { useCallback, useEffect, useState } from "react";
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
  Image,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
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

function AdminDashboard() {
  const emptyForm = {
    name: "",
    email: "",
    phone: "",
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
    image_base64: "",
  };

  const [view, setView] = useState("users");
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [stores, setStores] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setForm(emptyForm);
  };

  const fetchServices = useCallback(async () => {
    try {
      const data = await getAdminServices();
      setServices(Array.isArray(data) ? data : []);
    } catch (err) {
      console.log("MOBILE fetch services error:", err?.response?.data || err.message);
      setServices([]);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      if (view === "users") {
        const data = await getAdminUsers();
        setUsers(Array.isArray(data) ? data : []);
      }

      if (view === "technicians") {
        const data = await getAdminTechnicians();
        setTechnicians(Array.isArray(data) ? data : []);
      }

      if (view === "stores") {
        const data = await getAdminStores();
        setStores(Array.isArray(data) ? data : []);
      }

      if (view === "services") {
        const data = await getAdminServices();
        setServices(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    } finally {
      setLoading(false);
    }
  }, [view]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const pickServiceImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Notice", "Please allow image access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.35,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];

    if (!asset?.base64) return;

    const mimeType = asset.mimeType || "image/jpeg";

    setForm((prev) => ({
      ...prev,
      image_base64: `data:${mimeType};base64,${asset.base64}`,
      image_url: "",
    }));
  };

  const handleAdd = async () => {
    try {
      if (view === "users") {
        await createAdminUser({
          name: form.name,
          email: form.email,
          phone: form.phone,
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
          city: form.city,
          password: form.password,
          service_id: form.service_id,
          experience: form.experience,
          price_per_hour: form.price_per_hour,
        });
      }

      if (view === "stores") {
        await createAdminStore({
          store_name: form.store_name,
          category: form.category,
          city: form.city,
          address: form.address,
          owner_id: form.owner_id || null,
        });
      }

      if (view === "services") {
        await createAdminService({
          name: form.service_name,
          image_url: form.image_url,
          image_base64: form.image_base64,
        });
      }

      resetForm();
      await fetchData();
      await fetchServices();

      Alert.alert("Success", "Added successfully.");
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    }
  };

  const confirmDelete = (label, callback) => {
    Alert.alert("Confirm", `Delete this ${label}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: callback },
    ]);
  };

  const deleteItem = async (type, id) => {
    try {
      if (type === "user") await deleteAdminUser(id);
      if (type === "technician") await deleteAdminTechnician(id);
      if (type === "store") await deleteAdminStore(id);
      if (type === "service") await deleteAdminService(id);

      setSelectedProfile(null);
      await fetchData();
      await fetchServices();
    } catch (err) {
      Alert.alert("Error", err?.response?.data?.message || err.message);
    }
  };

  const switchView = (nextView) => {
    setView(nextView);
    resetForm();
    setSelectedProfile(null);
  };

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardText}>{item.email}</Text>
      <Text style={styles.cardText}>Phone: {item.phone || "-"}</Text>
      <Text style={styles.cardText}>City: {item.city || "-"}</Text>
      <Text style={styles.badge}>{item.role}</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity onPress={() => setSelectedProfile({ type: "user", data: item })}>
          <Text style={styles.link}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => confirmDelete("user", () => deleteItem("user", item.id))}
        >
          <Text style={styles.deleteLink}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderTechnician = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {item.service_image ? (
          <Image
            source={{ uri: getBackendImageUrl(item.service_image) }}
            style={styles.smallCircleImage}
          />
        ) : null}

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardText}>{item.email}</Text>
        </View>
      </View>

      <Text style={styles.cardText}>Phone: {item.phone || "-"}</Text>
      <Text style={styles.cardText}>City: {item.city || "-"}</Text>
      <Text style={styles.cardText}>Service: {item.service || "-"}</Text>
      <Text style={styles.cardText}>Experience: {item.experience || 0}</Text>
      <Text style={styles.cardText}>
        Price/hr: {Number(item.price_per_hour || 0).toFixed(2)}
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => setSelectedProfile({ type: "technician", data: item })}
        >
          <Text style={styles.link}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() =>
            confirmDelete("technician", () =>
              deleteItem("technician", item.technicianId)
            )
          }
        >
          <Text style={styles.deleteLink}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStore = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.store_name}</Text>
      <Text style={styles.cardText}>Category: {item.category}</Text>
      <Text style={styles.cardText}>City: {item.city}</Text>
      <Text style={styles.cardText}>Address: {item.address || "-"}</Text>
      <Text style={styles.cardText}>Owner: {item.owner_name || "-"}</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => confirmDelete("store", () => deleteItem("store", item.id))}
        >
          <Text style={styles.deleteLink}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderService = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {item.image_url ? (
          <Image
            source={{ uri: getBackendImageUrl(item.image_url) }}
            style={styles.smallCircleImage}
          />
        ) : null}

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardText}>{item.image_url || "-"}</Text>
        </View>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() =>
            confirmDelete("service", () => deleteItem("service", item.id))
          }
        >
          <Text style={styles.deleteLink}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <Header />

      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Admin Dashboard</Text>

        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={view === "users" ? styles.primaryBtn : styles.secondaryBtn}
            onPress={() => switchView("users")}
          >
            <Text style={styles.btnText}>Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={view === "technicians" ? styles.primaryBtn : styles.secondaryBtn}
            onPress={() => switchView("technicians")}
          >
            <Text style={styles.btnText}>Technicians</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={view === "stores" ? styles.primaryBtn : styles.secondaryBtn}
            onPress={() => switchView("stores")}
          >
            <Text style={styles.btnText}>Stores</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={view === "services" ? styles.primaryBtn : styles.secondaryBtn}
            onPress={() => switchView("services")}
          >
            <Text style={styles.btnText}>Services</Text>
          </TouchableOpacity>
        </View>

        {loading ? <ActivityIndicator size="large" color="#111" /> : null}

        {view === "users" ? (
          <FlatList
            scrollEnabled={false}
            data={users}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderUser}
          />
        ) : null}

        {view === "technicians" ? (
          <FlatList
            scrollEnabled={false}
            data={technicians}
            keyExtractor={(item) => String(item.technicianId)}
            renderItem={renderTechnician}
          />
        ) : null}

        {view === "stores" ? (
          <FlatList
            scrollEnabled={false}
            data={stores}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderStore}
          />
        ) : null}

        {view === "services" ? (
          <FlatList
            scrollEnabled={false}
            data={services}
            keyExtractor={(item) => String(item.id)}
            renderItem={renderService}
          />
        ) : null}

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>
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
                autoCapitalize="none"
                keyboardType="email-address"
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
            </>
          )}

          {view === "technicians" && (
            <>
              <Text style={styles.label}>Choose Service</Text>

              <View style={styles.servicePicker}>
                {services.map((service) => (
                  <TouchableOpacity
                    key={service.id}
                    style={[
                      styles.serviceOption,
                      String(form.service_id) === String(service.id) &&
                        styles.serviceOptionActive,
                    ]}
                    onPress={() =>
                      setForm({ ...form, service_id: String(service.id) })
                    }
                  >
                    {service.image_url ? (
                      <Image
                        source={{ uri: getBackendImageUrl(service.image_url) }}
                        style={styles.optionImage}
                      />
                    ) : null}

                    <Text style={styles.optionText}>{service.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TextInput
                style={styles.input}
                value={form.experience}
                placeholder="Experience"
                keyboardType="numeric"
                onChangeText={(text) => setForm({ ...form, experience: text })}
              />

              <TextInput
                style={styles.input}
                value={form.price_per_hour}
                placeholder="Price per hour"
                keyboardType="numeric"
                onChangeText={(text) =>
                  setForm({ ...form, price_per_hour: text })
                }
              />
            </>
          )}

          {view === "stores" && (
            <>
              <TextInput
                style={styles.input}
                value={form.store_name}
                placeholder="Store name"
                onChangeText={(text) => setForm({ ...form, store_name: text })}
              />

              <TextInput
                style={styles.input}
                value={form.category}
                placeholder="Category"
                onChangeText={(text) => setForm({ ...form, category: text })}
              />

              <TextInput
                style={styles.input}
                value={form.city}
                placeholder="City"
                onChangeText={(text) => setForm({ ...form, city: text })}
              />

              <TextInput
                style={styles.input}
                value={form.address}
                placeholder="Address"
                onChangeText={(text) => setForm({ ...form, address: text })}
              />

              <TextInput
                style={styles.input}
                value={form.owner_id}
                placeholder="Owner user id optional"
                keyboardType="numeric"
                onChangeText={(text) => setForm({ ...form, owner_id: text })}
              />
            </>
          )}

          {view === "services" && (
            <>
              <TextInput
                style={styles.input}
                value={form.service_name}
                placeholder="Service name"
                onChangeText={(text) =>
                  setForm({ ...form, service_name: text })
                }
              />

              <TouchableOpacity style={styles.pickBtn} onPress={pickServiceImage}>
                <Text style={styles.pickText}>Choose Image From Phone</Text>
              </TouchableOpacity>

              {form.image_base64 ? (
                <Image
                  source={{ uri: form.image_base64 }}
                  style={styles.previewImage}
                />
              ) : null}

              <TextInput
                style={styles.input}
                value={form.image_url}
                placeholder="Or write URL: /images/services/plumbing.png"
                autoCapitalize="none"
                onChangeText={(text) =>
                  setForm({
                    ...form,
                    image_url: text,
                    image_base64: "",
                  })
                }
              />
            </>
          )}

          <TouchableOpacity style={styles.primaryBtnFull} onPress={handleAdd}>
            <Text style={styles.btnText}>Add</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={!!selectedProfile} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            {selectedProfile ? (
              <>
                <Text style={styles.modalTitle}>
                  {selectedProfile.type === "user"
                    ? "User Profile"
                    : "Technician Profile"}
                </Text>

                <Text>Name: {selectedProfile.data.name}</Text>
                <Text>Email: {selectedProfile.data.email}</Text>
                <Text>Phone: {selectedProfile.data.phone || "-"}</Text>
                <Text>City: {selectedProfile.data.city || "-"}</Text>

                {selectedProfile.type === "technician" ? (
                  <>
                    <Text>Service: {selectedProfile.data.service || "-"}</Text>
                    <Text>Experience: {selectedProfile.data.experience || 0}</Text>
                    <Text>
                      Price/hr:{" "}
                      {Number(selectedProfile.data.price_per_hour || 0).toFixed(2)}
                    </Text>
                  </>
                ) : null}

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={() => setSelectedProfile(null)}
                >
                  <Text style={styles.btnText}>Close</Text>
                </TouchableOpacity>
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#E8DCCF",
  },
  content: {
    padding: 15,
    paddingBottom: 35,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    marginBottom: 14,
    color: "#111",
  },
  buttonRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 15,
  },
  primaryBtn: {
    backgroundColor: "#111",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginBottom: 8,
  },
  secondaryBtn: {
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 999,
    marginBottom: 8,
  },
  primaryBtnFull: {
    backgroundColor: "#111",
    padding: 13,
    borderRadius: 999,
    marginTop: 6,
    marginBottom: 10,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "900",
  },
  card: {
    padding: 14,
    backgroundColor: "#FFF9F3",
    marginBottom: 10,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 8,
  },
  cardTitle: {
    fontWeight: "900",
    fontSize: 18,
    color: "#111",
  },
  cardText: {
    color: "#3A3028",
    marginTop: 3,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#111",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 8,
    fontWeight: "800",
  },
  actionRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 12,
  },
  link: {
    color: "#111",
    fontWeight: "900",
  },
  deleteLink: {
    color: "#B00020",
    fontWeight: "900",
  },
  smallCircleImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#ddd",
  },
  form: {
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#D8C8B8",
    padding: 14,
    marginTop: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
    marginBottom: 10,
  },
  input: {
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    color: "#111",
  },
  label: {
    color: "#111",
    fontWeight: "900",
    marginBottom: 8,
  },
  servicePicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 10,
  },
  serviceOption: {
    width: "48%",
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#D8C8B8",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
  },
  serviceOptionActive: {
    borderColor: "#111",
    borderWidth: 2,
  },
  optionImage: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginBottom: 6,
  },
  optionText: {
    color: "#111",
    fontWeight: "800",
    textAlign: "center",
  },
  pickBtn: {
    backgroundColor: "#F6EDE2",
    borderWidth: 1,
    borderColor: "#111",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    marginBottom: 10,
  },
  pickText: {
    color: "#111",
    fontWeight: "900",
  },
  previewImage: {
    width: 90,
    height: 90,
    borderRadius: 45,
    marginBottom: 10,
    alignSelf: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    backgroundColor: "#FFF9F3",
    borderRadius: 18,
    padding: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    color: "#111",
    marginBottom: 12,
  },
  closeBtn: {
    backgroundColor: "#111",
    borderRadius: 999,
    paddingVertical: 12,
    marginTop: 14,
  },
});

export default AdminDashboard;