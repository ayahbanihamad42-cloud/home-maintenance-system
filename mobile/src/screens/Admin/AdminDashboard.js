import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import * as ImagePicker from "expo-image-picker";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import CustomDropdown from "../../components/Common/CustomDropdown";
import appStyles, { colors } from "../../styles/mobileStyles";

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

const jordanCityOptions = [
  "Amman",
  "Irbid",
  "Zarqa",
  "Aqaba",
  "Mafraq",
  "Jerash",
  "Ajloun",
  "Madaba",
  "Karak",
  "Tafilah",
  "Maan",
  "Balqa",
].map((city) => ({ label: city, value: city }));

function AdminDashboard({ navigation }) {
  const { t } = useTranslation();
  const { c } = useTheme();

  const [activeTab, setActiveTab] = useState("users");
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [stores, setStores] = useState([]);
  const [services, setServices] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [addVisible, setAddVisible] = useState(false);
  const [viewItem, setViewItem] = useState(null);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const emptyForm = {
    name: "",
    email: "",
    phone: "",
    dob: "",
    city: "",
    password: "",
    role: "user",
    service: "",
    service_id: "",
    experience: "",
    price_per_hour: "",
    store_name: "",
    category: "",
    address: "",
    owner_id: "",
    image_url: "",
    image_base64: "",
  };

  const [form, setForm] = useState(emptyForm);

  const tabs = [
    { key: "users", label: t("admin.users"), icon: "👥" },
    { key: "technicians", label: t("admin.technicians"), icon: "👷" },
    { key: "stores", label: t("admin.stores"), icon: "🏬" },
    { key: "services", label: t("admin.services"), icon: "🔧" },
  ];

  const load = async () => {
    try {
      setLoading(true);
      setMessage("");

      const [u, tech, st, s] = await Promise.all([
        getAdminUsers(),
        getAdminTechnicians(),
        getAdminStores(),
        getAdminServices(),
      ]);

      setUsers(Array.isArray(u) ? u : []);
      setTechnicians(Array.isArray(tech) ? tech : []);
      setStores(Array.isArray(st) ? st : []);
      setServices(Array.isArray(s) ? s : []);
    } catch (err) {
      setMessage(err.response?.data?.message || t("admin.errorLoad"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", load);
    load();
    return unsub;
  }, [navigation]);

  const list = useMemo(() => {
    if (activeTab === "users") return users;
    if (activeTab === "technicians") return technicians;
    if (activeTab === "stores") return stores;
    return services;
  }, [activeTab, users, technicians, stores, services]);

  const addTitle =
    activeTab === "users"
      ? t("admin.addUser")
      : activeTab === "technicians"
      ? t("admin.addTechnician")
      : activeTab === "stores"
      ? t("admin.addStore")
      : t("admin.addService");

  const update = (key, value) => {
    setMessage("");
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const formatDateValue = (date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  };

  const chooseServiceImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.5,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset?.base64) return;

    update("image_base64", `data:image/jpeg;base64,${asset.base64}`);
  };

  const createItem = async () => {
    try {
      setLoading(true);
      setMessage("");

      if (activeTab === "users") {
        await createAdminUser({
          name: form.name,
          email: form.email,
          phone: form.phone,
          dob: form.dob,
          city: form.city,
          password: form.password,
          role: form.role,
        });
      }

      if (activeTab === "technicians") {
        await createAdminTechnician({
          name: form.name,
          email: form.email,
          phone: form.phone,
          city: form.city,
          password: form.password,
          service: form.service,
          service_id: form.service_id ? Number(form.service_id) : null,
          experience: Number(form.experience || 0),
          price_per_hour: Number(form.price_per_hour || 0),
        });
      }

      if (activeTab === "stores") {
        await createAdminStore({
          store_name: form.store_name,
          category: form.category,
          city: form.city,
          address: form.address,
          owner_id: form.owner_id ? Number(form.owner_id) : null,
        });
      }

      if (activeTab === "services") {
        await createAdminService({
          name: form.name,
          image_url: form.image_url,
          image_base64: form.image_base64,
        });
      }

      setAddVisible(false);
      setForm(emptyForm);
      await load();
    } catch (err) {
      setMessage(err.response?.data?.message || t("admin.errorAdd"));
    } finally {
      setLoading(false);
    }
  };

  const getId = (item) =>
    item.technicianId ||
    item.technician_id ||
    item.service_id ||
    item.store_id ||
    item.id;

  const deleteItem = (item) => {
    Alert.alert(t("admin.delete"), t("admin.deleteConfirm"), [
      { text: t("admin.cancel"), style: "cancel" },
      {
        text: t("admin.delete"),
        style: "destructive",
        onPress: async () => {
          try {
            const id = getId(item);
            if (activeTab === "users") await deleteAdminUser(id);
            if (activeTab === "technicians") await deleteAdminTechnician(id);
            if (activeTab === "stores") await deleteAdminStore(id);
            if (activeTab === "services") await deleteAdminService(id);
            await load();
          } catch (err) {
            setMessage(err.response?.data?.message || t("admin.errorDelete"));
          }
        },
      },
    ]);
  };

  const titleOf = (item) =>
    item.name || item.store_name || item.service_name || item.service || t("admin.item");

  const subOf = (item) => {
    if (activeTab === "users") return item.role || "user";
    if (activeTab === "technicians")
      return item.service_name || item.service || t("admin.technician");
    if (activeTab === "stores") return item.category || t("admin.store");
    return t("admin.service");
  };

  const imageOf = (item) =>
    item.profile_image ||
    item.profileImage ||
    item.image_url ||
    item.service_image ||
    "";

  const renderAvatar = (item) => {
    const img = imageOf(item);

    if (img) {
      return (
        <Image source={{ uri: getBackendImageUrl(img) }} style={[styles.avatar, { backgroundColor: c.primarySoft }]} />
      );
    }

    return (
      <View style={[styles.avatarFallback, { backgroundColor: c.primarySoft }]}>
        <Text style={[styles.avatarText, { color: c.primary }]}>
          {String(titleOf(item)).charAt(0).toUpperCase()}
        </Text>
      </View>
    );
  };

  const renderRows = (item) => {
    if (activeTab === "users") {
      return (
        <>
          <Text style={[styles.info, { color: c.text }]}>{"✉️"} {t("admin.email")}: {item.email || "-"}</Text>
          <Text style={[styles.info, { color: c.text }]}>{"☎️"} {t("admin.phone")}: {item.phone || "-"}</Text>
          <Text style={[styles.info, { color: c.text }]}>{"🎂"} {t("admin.birthDate")}: {item.dob || "-"}</Text>
          <Text style={[styles.info, { color: c.text }]}>{"📍"} {t("admin.city")}: {item.city || "-"}</Text>
          <Text style={[styles.info, { color: c.text }]}>{"🪪"} {t("admin.role")}: {item.role || "-"}</Text>
        </>
      );
    }

    if (activeTab === "technicians") {
      return (
        <>
          <Text style={[styles.info, { color: c.text }]}>{"✉️"} {t("admin.email")}: {item.email || "-"}</Text>
          <Text style={[styles.info, { color: c.text }]}>{"☎️"} {t("admin.phone")}: {item.phone || "-"}</Text>
          <Text style={[styles.info, { color: c.text }]}>{"📍"} {t("admin.city")}: {item.city || "-"}</Text>
          <Text style={[styles.info, { color: c.text }]}>
            {"🛠"} {t("admin.service")}: {item.service_name || item.service || "-"}
          </Text>
          <Text style={[styles.info, { color: c.text }]}>{"⭐"} {t("admin.experience")}: {item.experience || 0}</Text>
          <Text style={[styles.info, { color: c.text }]}>
            {"💰"} {t("admin.price")}: {item.price_per_hour || 0} JOD
          </Text>
        </>
      );
    }

    if (activeTab === "stores") {
      return (
        <>
          <Text style={[styles.info, { color: c.text }]}>{"🏬"} {t("admin.store")}: {item.store_name || "-"}</Text>
          <Text style={[styles.info, { color: c.text }]}>{"📦"} {t("admin.category")}: {item.category || "-"}</Text>
          <Text style={[styles.info, { color: c.text }]}>{"📍"} {t("admin.city")}: {item.city || "-"}</Text>
          <Text style={[styles.info, { color: c.text }]}>{"🧭"} {t("admin.address")}: {item.address || "-"}</Text>
          <Text style={[styles.info, { color: c.text }]}>{"👤"} {t("admin.owner")}: {item.owner_name || "-"}</Text>
        </>
      );
    }

    return (
      <>
        <Text style={[styles.info, { color: c.text }]}>{"🔧"} {t("admin.name")}: {item.name || "-"}</Text>
        <Text style={[styles.info, { color: c.text }]}>{"🖼"} {t("admin.image")}: {item.image_url || "-"}</Text>
      </>
    );
  };

  const Field = ({ placeholder, value, onChangeText, secure = false }) => (
    <TextInput
      style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.border, color: c.text }]}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secure}
      placeholderTextColor={c.muted}
    />
  );

  const renderForm = () => {
    if (activeTab === "users") {
      return (
        <>
          <Field placeholder={t("admin.name")} value={form.name} onChangeText={(v) => update("name", v)} />
          <Field placeholder={t("admin.email")} value={form.email} onChangeText={(v) => update("email", v)} />
          <Field placeholder={t("admin.phone")} value={form.phone} onChangeText={(v) => update("phone", v)} />

          <TouchableOpacity
            style={[styles.input, { backgroundColor: c.inputBg, borderColor: c.border }]}
            onPress={() => setShowDobPicker(true)}
          >
            <Text style={{ color: form.dob ? c.text : c.muted }}>
              {form.dob || t("admin.birthDate")}
            </Text>
          </TouchableOpacity>

          <CustomDropdown
            label={t("admin.city")}
            value={form.city}
            options={jordanCityOptions}
            placeholder={t("admin.chooseCity")}
            onChange={(v) => update("city", v)}
          />

          <Field placeholder={t("admin.password")} value={form.password} onChangeText={(v) => update("password", v)} secure />

          <View style={styles.roleRow}>
            {["user", "technician", "admin"].map((role) => (
              <TouchableOpacity
                key={role}
                style={[styles.roleBtn, { borderColor: c.border }, form.role === role && { backgroundColor: c.primary, borderColor: c.primary }]}
                onPress={() => update("role", role)}
              >
                <Text style={[styles.roleText, { color: c.text }, form.role === role && { color: "#FFFFFF" }]}>
                  {role}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      );
    }

    if (activeTab === "technicians") {
      return (
        <>
          <Field placeholder={t("admin.name")} value={form.name} onChangeText={(v) => update("name", v)} />
          <Field placeholder={t("admin.email")} value={form.email} onChangeText={(v) => update("email", v)} />
          <Field placeholder={t("admin.phone")} value={form.phone} onChangeText={(v) => update("phone", v)} />

          <CustomDropdown
            label={t("admin.city")}
            value={form.city}
            options={jordanCityOptions}
            placeholder={t("admin.chooseCity")}
            onChange={(v) => update("city", v)}
          />

          <Field placeholder={t("admin.password")} value={form.password} onChangeText={(v) => update("password", v)} secure />
          <Field placeholder={t("admin.serviceName")} value={form.service} onChangeText={(v) => update("service", v)} />
          <Field placeholder={t("admin.serviceIdOptional")} value={form.service_id} onChangeText={(v) => update("service_id", v)} />
          <Field placeholder={t("admin.experience")} value={form.experience} onChangeText={(v) => update("experience", v)} />
          <Field placeholder={t("admin.pricePerHour")} value={form.price_per_hour} onChangeText={(v) => update("price_per_hour", v)} />
        </>
      );
    }

    if (activeTab === "stores") {
      return (
        <>
          <Field placeholder={t("admin.storeName")} value={form.store_name} onChangeText={(v) => update("store_name", v)} />
          <Field placeholder={t("admin.category")} value={form.category} onChangeText={(v) => update("category", v)} />

          <CustomDropdown
            label={t("admin.city")}
            value={form.city}
            options={jordanCityOptions}
            placeholder={t("admin.chooseCity")}
            onChange={(v) => update("city", v)}
          />

          <Field placeholder={t("admin.address")} value={form.address} onChangeText={(v) => update("address", v)} />
          <Field placeholder={t("admin.ownerIdOptional")} value={form.owner_id} onChangeText={(v) => update("owner_id", v)} />
        </>
      );
    }

    return (
      <>
        <Field placeholder={t("admin.serviceName")} value={form.name} onChangeText={(v) => update("name", v)} />

        <TouchableOpacity style={appStyles.secondaryBtn} onPress={chooseServiceImage}>
          <Text style={appStyles.secondaryBtnText}>{t("admin.chooseServiceImage")}</Text>
        </TouchableOpacity>

        {form.image_base64 ? (
          <Image
            source={{ uri: form.image_base64 }}
            style={{
              width: "100%",
              height: 180,
              borderRadius: 18,
              marginBottom: 12,
            }}
          />
        ) : null}
      </>
    );
  };

  return (
    <SafeAreaView style={[appStyles.safe, { backgroundColor: c.bg }]}>
      <Header navigation={navigation} title={t("admin.title")} />

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <HeroSection
          title={t("admin.dashboardTitle")}
          subtitle={t("admin.dashboardSubtitle")}
        />

        {message ? (
          <View style={appStyles.errorBox}>
            <Text style={appStyles.errorText}>{message}</Text>
          </View>
        ) : null}

        <View style={styles.tabs}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, { backgroundColor: c.card, borderColor: c.border }, activeTab === tab.key && { backgroundColor: c.primary, borderColor: c.primary }]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabText, { color: c.text }, activeTab === tab.key && { color: "#FFFFFF" }]}>
                {tab.icon} {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity style={[styles.addButton, { backgroundColor: c.primary }]} onPress={() => setAddVisible(true)}>
          <Text style={styles.addText}>{"＋"} {addTitle}</Text>
        </TouchableOpacity>

        {loading ? (
          <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.emptyText, { color: c.muted }]}>{t("admin.loading")}</Text>
          </View>
        ) : list.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: c.card, borderColor: c.border }]}>
            <Text style={[styles.emptyText, { color: c.muted }]}>{t("admin.noData")}</Text>
          </View>
        ) : (
          list.map((item, index) => (
            <View style={[styles.card, { backgroundColor: c.card, borderColor: c.border }]} key={getId(item) || index}>
              <View style={styles.cardHeader}>
                {renderAvatar(item)}
                <View style={{ flex: 1 }}>
                  <Text style={[styles.cardTitle, { color: c.text }]}>{titleOf(item)}</Text>
                  <Text style={[styles.cardSub, { color: c.muted }]}>{subOf(item)}</Text>
                </View>
              </View>

              <View style={styles.infoBox}>{renderRows(item)}</View>

              <View style={styles.actions}>
                <TouchableOpacity style={[styles.viewBtn, { backgroundColor: c.primary }]} onPress={() => setViewItem(item)}>
                  <Text style={styles.viewText}>{"👁"} {t("admin.view")}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={[styles.deleteBtn, { backgroundColor: c.card }]} onPress={() => deleteItem(item)}>
                  <Text style={styles.deleteText}>{"🗑"} {t("admin.delete")}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      <Modal transparent visible={addVisible} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={[appStyles.modalBox, { backgroundColor: c.card }]}>
            <View style={appStyles.between}>
              <Text style={[appStyles.modalTitle, { color: c.text }]}>{addTitle}</Text>
              <TouchableOpacity onPress={() => setAddVisible(false)}>
                <Text style={[styles.close, { color: c.text }]}>{"✕"}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {renderForm()}

              <TouchableOpacity style={[styles.saveBtn, { backgroundColor: c.primary }]} onPress={createItem}>
                <Text style={styles.saveText}>
                  {loading ? t("admin.saving") : addTitle}
                </Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={!!viewItem} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={[appStyles.modalBox, { backgroundColor: c.card }]}>
            <View style={appStyles.between}>
              <Text style={[appStyles.modalTitle, { color: c.text }]}>{t("admin.details")}</Text>
              <TouchableOpacity onPress={() => setViewItem(null)}>
                <Text style={[styles.close, { color: c.text }]}>{"✕"}</Text>
              </TouchableOpacity>
            </View>

            {viewItem ? (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.viewHead}>
                  {renderAvatar(viewItem)}
                  <Text style={[styles.viewName, { color: c.text }]}>{titleOf(viewItem)}</Text>
                  <Text style={[styles.cardSub, { color: c.muted }]}>{subOf(viewItem)}</Text>
                </View>

                <View style={styles.infoBox}>{renderRows(viewItem)}</View>
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>

      {showDobPicker ? (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={(event, date) => {
            if (Platform.OS !== "ios") setShowDobPicker(false);
            if (date) update("dob", formatDateValue(date));
          }}
        />
      ) : null}

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 16,
    paddingTop: 24,
    paddingBottom: 120,
  },
  tabs: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 14,
  },
  tab: {
    borderWidth: 1,
    borderRadius: 16,
    paddingVertical: 11,
    paddingHorizontal: 14,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "900",
  },
  addButton: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    marginBottom: 18,
  },
  addText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "900",
  },
  card: {
    borderWidth: 1,
    borderRadius: 26,
    padding: 18,
    marginBottom: 18,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
  },
  avatarFallback: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontSize: 24,
    fontWeight: "900",
  },
  cardTitle: {
    fontSize: 19,
    fontWeight: "900",
  },
  cardSub: {
    fontSize: 14,
    fontWeight: "800",
    marginTop: 3,
  },
  infoBox: {
    marginTop: 14,
  },
  info: {
    fontSize: 14,
    lineHeight: 24,
    fontWeight: "700",
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
  viewBtn: {
    flex: 1,
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
  },
  viewText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E9C6D4",
    borderRadius: 15,
    paddingVertical: 12,
    alignItems: "center",
  },
  deleteText: {
    color: "#D9466F",
    fontWeight: "900",
    fontSize: 14,
  },
  emptyCard: {
    borderWidth: 1,
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
  },
  emptyText: {
    fontSize: 16,
    fontWeight: "800",
  },
  input: {
    borderWidth: 1,
    borderRadius: 18,
    minHeight: 54,
    paddingHorizontal: 14,
    justifyContent: "center",
    fontSize: 15,
    marginBottom: 12,
  },
  roleRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  roleBtn: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: "center",
  },
  roleText: {
    fontWeight: "900",
  },
  saveBtn: {
    borderRadius: 18,
    paddingVertical: 15,
    alignItems: "center",
    marginTop: 6,
  },
  saveText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "900",
  },
  close: {
    fontSize: 28,
    fontWeight: "900",
  },
  viewHead: {
    alignItems: "center",
    marginBottom: 14,
  },
  viewName: {
    fontSize: 22,
    fontWeight: "900",
    marginTop: 10,
  },
});

export default AdminDashboard;
