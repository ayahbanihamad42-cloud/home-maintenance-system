import React, { useCallback, useEffect, useState } from "react";
import Header from "../../components/Common/Header";
import API from "../../services/api";
import { getImageUrl } from "../../services/services.js";

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
} from "react-native";

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
  const [stores, setStores] = useState([]);
  const [services, setServices] = useState([]);

  const [selectedProfile, setSelectedProfile] = useState(null);

  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    service_id: "",
    experience: "",
    store_name: "",
    category: "",
    address: "",
    owner_id: "",
    service_name: "",
    image_url: "",
  };

  const [form, setForm] = useState(emptyForm);

  const resetForm = () => {
    setForm(emptyForm);
  };

  const fetchServices = useCallback(async () => {
    try {
      const res = await API.get("/admin/services");
      setServices(res.data || []);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  }, []);

  const fetchData = useCallback(async () => {
    try {
      if (view === "users") {
        const res = await API.get("/admin/users");
        setUsers(res.data || []);
      } else if (view === "technicians") {
        const res = await API.get("/admin/technicians");
        setTechnicians(res.data || []);
      } else if (view === "stores") {
        const res = await API.get("/admin/stores");
        setStores(res.data || []);
      } else if (view === "services") {
        const res = await API.get("/admin/services");
        setServices(res.data || []);
      }
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || error.message);
    }
  }, [view]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const confirmAction = (message, onConfirm) => {
    Alert.alert("Confirm", message, [
      { text: "Cancel", style: "cancel" },
      { text: "OK", onPress: onConfirm },
    ]);
  };

  const handleDeleteUser = async (userId) => {
    confirmAction("Are you sure you want to delete this user?", async () => {
      try {
        await API.delete(`/admin/users/${userId}`);
        setSelectedProfile(null);
        fetchData();
      } catch (error) {
        Alert.alert("Error", error.response?.data?.message || error.message);
      }
    });
  };

  const handleDeleteTechnician = async (technicianId) => {
    confirmAction("Are you sure you want to delete this technician?", async () => {
      try {
        await API.delete(`/admin/technicians/${technicianId}`);
        setSelectedProfile(null);
        fetchData();
      } catch (error) {
        Alert.alert("Error", error.response?.data?.message || error.message);
      }
    });
  };

  const handleDeleteStore = async (storeId) => {
    confirmAction("Are you sure you want to delete this store?", async () => {
      try {
        await API.delete(`/admin/stores/${storeId}`);
        fetchData();
      } catch (error) {
        Alert.alert("Error", error.response?.data?.message || error.message);
      }
    });
  };

  const handleDeleteService = async (serviceId) => {
    confirmAction("Are you sure you want to delete this service?", async () => {
      try {
        await API.delete(`/admin/services/${serviceId}`);
        fetchData();
        fetchServices();
      } catch (error) {
        Alert.alert("Error", error.response?.data?.message || error.message);
      }
    });
  };

  const handleAdd = async () => {
    try {
      if (view === "users") {
        await API.post("/admin/users", {
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          password: form.password,
          role: "user",
        });
      } else if (view === "technicians") {
        await API.post("/admin/technicians", {
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          password: form.password,
          service_id: form.service_id,
          experience: form.experience,
        });
      } else if (view === "stores") {
        await API.post("/admin/stores", {
          store_name: form.store_name,
          category: form.category,
          city: form.city,
          address: form.address,
          owner_id: form.owner_id || null,
        });
      } else if (view === "services") {
        await API.post("/admin/services", {
          name: form.service_name,
          image_url: form.image_url,
        });

        fetchServices();
      }

      resetForm();
      fetchData();
      Alert.alert("Success", "Added successfully.");
    } catch (error) {
      Alert.alert("Error", error.response?.data?.message || error.message);
    }
  };

  const getTitle = () => {
    if (view === "users") return "Add User";
    if (view === "technicians") return "Add Technician";
    if (view === "stores") return "Add Store";
    return "Add Service";
  };

  const renderUser = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{item.name}</Text>
      <Text style={styles.cardText}>{item.email}</Text>
      <Text style={styles.cardText}>{item.phone || "-"}</Text>
      <Text style={styles.cardText}>{item.city || "-"}</Text>
      <Text style={styles.badge}>{item.role}</Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => setSelectedProfile({ type: "user", data: item })}
        >
          <Text style={styles.link}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDeleteUser(item.id)}>
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
            source={{ uri: getImageUrl(item.service_image) }}
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
      <Text style={styles.cardText}>
        Experience: {item.experience || 0} yrs
      </Text>

      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => setSelectedProfile({ type: "technician", data: item })}
        >
          <Text style={styles.link}>View</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleDeleteTechnician(item.technicianId)}>
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

      <TouchableOpacity onPress={() => handleDeleteStore(item.id)}>
        <Text style={styles.deleteLink}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  const renderService = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Image
          source={{ uri: getImageUrl(item.image_url) }}
          style={styles.serviceImage}
        />

        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardText}>{item.image_url}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => handleDeleteService(item.id)}>
        <Text style={styles.deleteLink}>Delete</Text>
      </TouchableOpacity>
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
            onPress={() => setView("users")}
          >
            <Text style={styles.btnText}>Users</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={
              view === "technicians" ? styles.primaryBtn : styles.secondaryBtn
            }
            onPress={() => setView("technicians")}
          >
            <Text style={styles.btnText}>Technicians</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={view === "stores" ? styles.primaryBtn : styles.secondaryBtn}
            onPress={() => setView("stores")}
          >
            <Text style={styles.btnText}>Stores</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={view === "services" ? styles.primaryBtn : styles.secondaryBtn}
            onPress={() => setView("services")}
          >
            <Text style={styles.btnText}>Services</Text>
          </TouchableOpacity>
        </View>

        {view === "users" ? (
          <FlatList
            scrollEnabled={false}
            data={users}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderUser}
          />
        ) : null}

        {view === "technicians" ? (
          <FlatList
            scrollEnabled={false}
            data={technicians}
            keyExtractor={(item) => item.technicianId.toString()}
            renderItem={renderTechnician}
          />
        ) : null}

        {view === "stores" ? (
          <FlatList
            scrollEnabled={false}
            data={stores}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderStore}
          />
        ) : null}

        {view === "services" ? (
          <FlatList
            scrollEnabled={false}
            data={services}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderService}
          />
        ) : null}

        <View style={styles.form}>
          <Text style={styles.sectionTitle}>{getTitle()}</Text>

          {view === "users" || view === "technicians" ? (
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
                keyboardType="email-address"
                autoCapitalize="none"
                onChangeText={(text) => setForm({ ...form, email: text })}
              />

              <TextInput
                style={styles.input}
                value={form.phone}
                placeholder="Phone"
                keyboardType="phone-pad"
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
          ) : null}

          {view === "technicians" ? (
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
                    <Image
                      source={{ uri: getImageUrl(service.image_url) }}
                      style={styles.optionImage}
                    />

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
            </>
          ) : null}

          {view === "stores" ? (
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
          ) : null}

          {view === "services" ? (
            <>
              <TextInput
                style={styles.input}
                value={form.service_name}
                placeholder="Service name"
                onChangeText={(text) =>
                  setForm({ ...form, service_name: text })
                }
              />

              <TextInput
                style={styles.input}
                value={form.image_url}
                placeholder="/images/services/cleaning.png"
                autoCapitalize="none"
                onChangeText={(text) => setForm({ ...form, image_url: text })}
              />
            </>
          ) : null}

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

                <InfoRow label="Name" value={selectedProfile.data.name || "-"} />
                <InfoRow label="Email" value={selectedProfile.data.email || "-"} />
                <InfoRow label="Phone" value={selectedProfile.data.phone || "-"} />
                <InfoRow label="City" value={selectedProfile.data.city || "-"} />

                {selectedProfile.type === "technician" ? (
                  <>
                    <InfoRow
                      label="Service"
                      value={selectedProfile.data.service || "-"}
                    />
                    <InfoRow
                      label="Experience"
                      value={`${selectedProfile.data.experience || 0} yrs`}
                    />
                  </>
                ) : null}

                <TouchableOpacity onPress={() => setSelectedProfile(null)}>
                  <Text style={styles.link}>Close</Text>
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
    fontSize: 22,
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
    borderRadius: 10,
    marginBottom: 8,
  },
  secondaryBtn: {
    backgroundColor: "#6c757d",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    marginBottom: 8,
  },
  primaryBtnFull: {
    backgroundColor: "#111",
    padding: 12,
    borderRadius: 10,
    marginTop: 6,
    marginBottom: 10,
  },
  btnText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "800",
  },
  card: {
    padding: 14,
    backgroundColor: "#FFF9F3",
    marginBottom: 10,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  cardTitle: {
    color: "#111",
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 3,
  },
  cardText: {
    color: "#333",
    marginBottom: 3,
  },
  badge: {
    alignSelf: "flex-start",
    backgroundColor: "#111",
    color: "#fff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
    marginTop: 5,
    overflow: "hidden",
  },
  actionRow: {
    flexDirection: "row",
    gap: 18,
    marginTop: 8,
  },
  link: {
    color: "#2563eb",
    marginTop: 8,
    fontWeight: "800",
  },
  deleteLink: {
    color: "#dc2626",
    marginTop: 8,
    fontWeight: "800",
  },
  form: {
    marginTop: 20,
    backgroundColor: "#FFF9F3",
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D8C8B8",
  },
  sectionTitle: {
    fontWeight: "900",
    marginBottom: 12,
    color: "#111",
    fontSize: 17,
  },
  label: {
    fontWeight: "800",
    color: "#111",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 10,
    padding: 11,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  smallCircleImage: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: "#fff",
  },
  serviceImage: {
    width: 58,
    height: 58,
    borderRadius: 29,
    backgroundColor: "#fff",
  },
  servicePicker: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 10,
  },
  serviceOption: {
    width: "47%",
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  serviceOptionActive: {
    borderColor: "#111",
    borderWidth: 2,
  },
  optionImage: {
    width: 54,
    height: 54,
    borderRadius: 27,
    marginBottom: 6,
    backgroundColor: "#eee",
  },
  optionText: {
    fontWeight: "800",
    color: "#111",
    textAlign: "center",
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
    borderRadius: 14,
    width: "85%",
  },
  modalTitle: {
    fontWeight: "900",
    marginBottom: 12,
    fontSize: 17,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    gap: 10,
  },
  infoLabel: {
    fontWeight: "800",
    color: "#111",
  },
  infoValue: {
    color: "#333",
    flexShrink: 1,
    textAlign: "right",
  },
});

export default AdminDashboard;