import React, { useEffect, useRef, useState } from "react";
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
import { useTranslation } from "react-i18next";
import { useTheme } from "../../context/ThemeContext";

import Header from "../../components/Common/Header";
import FloatingActions from "../../components/Common/FloatingActions";
import HeroSection from "../../components/Common/HeroSection";
import TechnicianGalleryManager from "../technician/TechnicianGalleryManager";

import API from "../../services/api";
import {
  getMyPaymentInfo,
  saveMyPaymentInfo,
  getMyBalance,
} from "../../services/paymentservice";

import { getStyles } from "../../styles/mobileStyles";

const jordanCities = [
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
];

function UserProfile({ navigation }) {
  const { t, i18n } = useTranslation();
  const { c, toggleTheme } = useTheme();
  const appStyles = getStyles(c);

  const [currentUser, setCurrentUser] = useState({});
  const [profile, setProfile] = useState(null);
  const [technicianGalleryId, setTechnicianGalleryId] = useState("");

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [submenu, setSubmenu] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [dob, setDob] = useState("");

  const [photoPreview, setPhotoPreview] = useState("");
  const [profileMessage, setProfileMessage] = useState(null);

  const [paymentInfo, setPaymentInfo] = useState({
    account_holder: "",
    wallet_name: "",
    wallet_number: "",
    mock_account_number: "",
  });

  const [balance, setBalance] = useState({
    totalEarnings: 0,
    totalPayments: 0,
    paymentInfo: null,
  });

  const isMounted = useRef(true);

  const baseUrl = String(API.defaults.baseURL || "").replace(/\/api\/?$/, "");

  const fixImageUrl = (url) => {
    if (!url) return "";
    if (String(url).startsWith("http")) return url;
    if (String(url).startsWith("data:image")) return url;
    return `${baseUrl}${url}`;
  };

  const formatDate = (value) => {
    if (!value) return "";
    const raw = String(value).trim();
    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
    const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
    if (match) return match[1];
    return raw.slice(0, 10);
  };

  const getProfilePhoto = (data) => {
    return (
      data?.profile_image ||
      data?.profile_photo ||
      data?.photo ||
      data?.avatar ||
      ""
    );
  };

  const isTechnician =
    String(profile?.role || currentUser?.role || "").toLowerCase() ===
    "technician";

  const getTechnicianIdFromData = (data) => {
    if (!data) return "";

    return (
      data.technician_id ||
      data.technicianId ||
      data.tech_id ||
      data.technician?.id ||
      data.technician?.technician_id ||
      data.technician?.technicianId ||
      ""
    );
  };

  const loadCurrentUser = async () => {
    const raw = await AsyncStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : {};
    setCurrentUser(user);
    return user;
  };

  const loadTechnicianGalleryId = async (profileData, userData) => {
    const directId =
      getTechnicianIdFromData(profileData) || getTechnicianIdFromData(userData);

    if (directId) {
      setTechnicianGalleryId(directId);
      return;
    }

    const possibleUrls = [
      "/technicians/me",
      `/technicians/user/${userData.id}`,
      `/technicians/by-user/${userData.id}`,
    ];

    for (const url of possibleUrls) {
      try {
        const res = await API.get(url);
        const data = res.data?.technician || res.data?.data || res.data;

        const foundId =
          getTechnicianIdFromData(data) ||
          data?.id ||
          data?.technician_id ||
          data?.technicianId ||
          "";

        if (foundId) {
          setTechnicianGalleryId(foundId);
          return;
        }
      } catch {}
    }

    setTechnicianGalleryId("");
  };

  const loadProfile = async () => {
    try {
      setProfileMessage(null);

      const userData = await loadCurrentUser();

      if (!userData?.id) {
        setProfileMessage({
          type: "error",
          title: t("common.error"),
          body: t("profile.errors.missingUserId"),
        });
        return;
      }

      const res = await API.get(`/users/${userData.id}`);
      const data = res.data || {};

      setProfile(data);
      setEmail(data.email || "");
      setPhone(data.phone || "");
      setCity(data.city || "");
      setDob(formatDate(data.dob));
      setPhotoPreview(getProfilePhoto(data));

      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          ...userData,
          ...data,
          profile_image: getProfilePhoto(data),
        })
      );

      const role = String(data.role || userData.role || "").toLowerCase();

      if (role === "technician") {
        await loadTechnicianGalleryId(data, userData);
      } else {
        setTechnicianGalleryId("");
      }
    } catch (err) {
      setProfileMessage({
        type: "error",
        title: t("common.error"),
        body: t("profile.errors.loadFailed"),
      });
    }
  };

  useEffect(() => {
    isMounted.current = true;
    const unsub = navigation.addListener("focus", loadProfile);
    loadProfile();

    return () => {
      isMounted.current = false;
      unsub?.();
    };
  }, [navigation]);

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

  const handleShowBalance = async () => {
    try {
      setSettingsOpen(false);
      setSubmenu(null);

      const data = await getMyBalance();

      setBalance({
        totalEarnings: Number(data?.totalEarnings || 0),
        totalPayments: Number(data?.totalPayments || 0),
        paymentInfo: data?.paymentInfo || null,
      });

      setShowBalanceModal(true);
    } catch (err) {
      setProfileMessage({
        type: "error",
        title: t("common.error"),
        body: err.response?.data?.message || t("profile.errors.balanceFailed"),
      });
    }
  };

  const openPaymentModal = async () => {
    setSettingsOpen(false);
    setSubmenu(null);
    await loadPaymentInfo();
    setShowPaymentModal(true);
  };

  const handleSavePaymentInfo = async () => {
    try {
      await saveMyPaymentInfo(paymentInfo);

      setShowPaymentModal(false);

      setProfileMessage({
        type: "success",
        title: t("profile.paymentInfoSavedTitle"),
        body: t("profile.paymentInfoSavedBody"),
      });
    } catch (err) {
      setProfileMessage({
        type: "error",
        title: t("common.error"),
        body: err.response?.data?.message || t("profile.errors.savePaymentFailed"),
      });
    }
  };

  const handleSaveProfile = async () => {
    try {
      const payload = {
        name: profile?.name,
        email,
        phone,
        city,
        dob,
      };

      await API.patch(`/users/${currentUser.id}`, payload);

      const updatedProfile = { ...profile, ...payload };
      setProfile(updatedProfile);

      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          ...currentUser,
          email,
          phone,
          city,
          dob,
          profile_image: updatedProfile.profile_image,
        })
      );

      setShowEditModal(false);

      setProfileMessage({
        type: "success",
        title: t("profile.savedTitle"),
        body: t("profile.savedBody"),
      });

      await loadProfile();
    } catch (err) {
      setProfileMessage({
        type: "error",
        title: t("common.error"),
        body: err.response?.data?.message || t("profile.errors.updateFailed"),
      });
    }
  };

  const handlePhotoChange = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        setProfileMessage({
          type: "error",
          title: t("common.error"),
          body: t("profile.errors.galleryPermission"),
        });
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.45,
        base64: true,
      });

      if (result.canceled) return;

      const asset = result.assets?.[0];
      if (!asset?.base64) return;

      const base64Image = `data:image/jpeg;base64,${asset.base64}`;

      await API.patch(`/users/${currentUser.id}/photo`, {
        profile_image: base64Image,
      });

      const updatedProfile = {
        ...profile,
        profile_image: base64Image,
      };

      setProfile(updatedProfile);
      setPhotoPreview(base64Image);

      await AsyncStorage.setItem(
        "user",
        JSON.stringify({
          ...currentUser,
          profile_image: base64Image,
        })
      );

      setShowPhotoModal(false);

      setProfileMessage({
        type: "success",
        title: t("profile.savedTitle"),
        body: t("profile.photoUpdated"),
      });

      await loadProfile();
    } catch (err) {
      setProfileMessage({
        type: "error",
        title: t("common.error"),
        body: err.response?.data?.message || t("profile.errors.photoFailed"),
      });
    }
  };

  const openSoonMessage = (name) => {
    setSettingsOpen(false);
    setSubmenu(null);

    setProfileMessage({
      type: "warning",
      title: name,
      body: t("profile.comingSoon"),
    });
  };

  if (!profile) {
    return (
      <SafeAreaView style={appStyles.safe}>
        <Header navigation={navigation} title={t("profile.headerTitle")} />
        <ScrollView contentContainerStyle={appStyles.pageContent}>
          <View style={appStyles.card}>
            <Text style={appStyles.text}>
              {profileMessage?.body || t("common.loading")}
            </Text>
          </View>
        </ScrollView>
        <FloatingActions navigation={navigation} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={appStyles.safe}>
      <Header navigation={navigation} title={t("profile.headerTitle")} />

      <ScrollView contentContainerStyle={appStyles.pageContent}>
        <HeroSection
          title={profile.name || t("profile.defaultTitle")}
          subtitle={`${profile.role || "user"} ${t("profile.account")}`}
        />

        <View style={appStyles.card}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
            {photoPreview ? (
              <Image
                source={{ uri: fixImageUrl(photoPreview) }}
                style={{ width: 82, height: 82, borderRadius: 41 }}
              />
            ) : (
              <View
                style={{
                  width: 82,
                  height: 82,
                  borderRadius: 41,
                  backgroundColor: c.primarySoft,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    color: c.primary,
                    fontSize: 34,
                    fontWeight: "900",
                  }}
                >
                  {profile.name?.charAt(0)?.toUpperCase() || "U"}
                </Text>
              </View>
            )}

            <View style={{ flex: 1 }}>
              <Text style={appStyles.sectionTitle}>{profile.name}</Text>
              <Text style={appStyles.mutedText}>{profile.role}</Text>
            </View>

            <TouchableOpacity onPress={() => setSettingsOpen(true)}>
              <Text style={{ fontSize: 32 }}>⚙️</Text>
            </TouchableOpacity>
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={appStyles.sectionTitle}>{t("profile.profileInfo")}</Text>
            <Text style={appStyles.text}>{t("profile.email")}: {profile.email || "-"}</Text>
            <Text style={appStyles.text}>{t("profile.phone")}: {profile.phone || "-"}</Text>
            <Text style={appStyles.text}>{t("profile.city")}: {profile.city || "-"}</Text>
            <Text style={appStyles.text}>
              {t("profile.birthDate")}: {formatDate(profile.dob) || "-"}
            </Text>
          </View>
        </View>

        {profileMessage ? (
          <View
            style={
              profileMessage.type === "error"
                ? appStyles.errorBox
                : profileMessage.type === "success"
                ? appStyles.successBox
                : appStyles.warningBox
            }
          >
            <Text
              style={
                profileMessage.type === "error"
                  ? appStyles.errorText
                  : profileMessage.type === "success"
                  ? appStyles.successText
                  : appStyles.text
              }
            >
              {profileMessage.title}: {profileMessage.body}
            </Text>
          </View>
        ) : null}

        {isTechnician ? (
          <View style={{ marginTop: 8 }}>
            {technicianGalleryId ? (
              <TechnicianGalleryManager
                navigation={navigation}
                embedded
                technicianId={technicianGalleryId}
              />
            ) : (
              <View style={appStyles.warningBox}>
                <Text style={appStyles.text}>
                  {t("profile.galleryMissing")}
                </Text>
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>

      <Modal transparent visible={settingsOpen} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <Text style={appStyles.modalTitle}>{t("profile.settings")}</Text>

            <TouchableOpacity
              style={appStyles.secondaryBtn}
              onPress={() => {
                setShowEditModal(true);
                setSettingsOpen(false);
                setSubmenu(null);
              }}
            >
              <Text style={appStyles.secondaryBtnText}>{t("profile.editContact")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={appStyles.secondaryBtn}
              onPress={() => {
                setShowPhotoModal(true);
                setSettingsOpen(false);
                setSubmenu(null);
              }}
            >
              <Text style={appStyles.secondaryBtnText}>{t("profile.editPhoto")}</Text>
            </TouchableOpacity>

            {isTechnician ? (
              <>
                <TouchableOpacity
                  style={appStyles.secondaryBtn}
                  onPress={openPaymentModal}
                >
                  <Text style={appStyles.secondaryBtnText}>{t("profile.paymentInfo")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={appStyles.secondaryBtn}
                  onPress={handleShowBalance}
                >
                  <Text style={appStyles.secondaryBtnText}>{t("profile.myBalance")}</Text>
                </TouchableOpacity>
              </>
            ) : null}

            <TouchableOpacity
              style={appStyles.secondaryBtn}
              onPress={() =>
                setSubmenu(submenu === "language" ? null : "language")
              }
            >
              <Text style={appStyles.secondaryBtnText}>{t("profile.language")} ▸</Text>
            </TouchableOpacity>

            {submenu === "language" ? (
              <View>
                <TouchableOpacity
                  style={appStyles.secondaryBtn}
                  onPress={() => {
                    i18n.changeLanguage("ar");
                    setSettingsOpen(false);
                    setSubmenu(null);
                  }}
                >
                  <Text style={appStyles.secondaryBtnText}>{t("profile.arabic")}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={appStyles.secondaryBtn}
                  onPress={() => {
                    i18n.changeLanguage("en");
                    setSettingsOpen(false);
                    setSubmenu(null);
                  }}
                >
                  <Text style={appStyles.secondaryBtnText}>{t("profile.english")}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity
              style={appStyles.secondaryBtn}
              onPress={() => setSubmenu(submenu === "theme" ? null : "theme")}
            >
              <Text style={appStyles.secondaryBtnText}>{t("profile.theme")} ▸</Text>
            </TouchableOpacity>

            {submenu === "theme" ? (
              <View>
                <TouchableOpacity
                  style={appStyles.secondaryBtn}
                  onPress={() => {
                    toggleTheme();
                    setSettingsOpen(false);
                    setSubmenu(null);
                  }}
                >
                  <Text style={appStyles.secondaryBtnText}>{t("profile.toggleTheme")}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            <TouchableOpacity
              style={appStyles.primaryBtn}
              onPress={() => {
                setSettingsOpen(false);
                setSubmenu(null);
              }}
            >
              <Text style={appStyles.primaryBtnText}>{t("common.close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showEditModal} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <Text style={appStyles.modalTitle}>{t("profile.updateContact")}</Text>

            <Text style={appStyles.label}>{t("profile.email")}</Text>
            <TextInput
              style={appStyles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
            />

            <Text style={appStyles.label}>{t("profile.phone")}</Text>
            <TextInput
              style={appStyles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />

            <Text style={appStyles.label}>{t("profile.city")}</Text>
            <TouchableOpacity
              style={appStyles.input}
              onPress={() => setCityOpen(true)}
            >
              <Text style={appStyles.text}>{city || t("profile.chooseCity")}</Text>
            </TouchableOpacity>

            <Text style={appStyles.label}>{t("profile.birthDate")}</Text>
            <TextInput
              style={appStyles.input}
              value={dob}
              onChangeText={setDob}
              placeholder="YYYY-MM-DD"
            />

            <TouchableOpacity
              style={appStyles.primaryBtn}
              onPress={handleSaveProfile}
            >
              <Text style={appStyles.primaryBtnText}>{t("common.save")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={appStyles.secondaryBtn}
              onPress={() => setShowEditModal(false)}
            >
              <Text style={appStyles.secondaryBtnText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={cityOpen} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <Text style={appStyles.modalTitle}>{t("profile.chooseCity")}</Text>

            <ScrollView>
              {jordanCities.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={appStyles.secondaryBtn}
                  onPress={() => {
                    setCity(item);
                    setCityOpen(false);
                  }}
                >
                  <Text style={appStyles.secondaryBtnText}>{item}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={appStyles.primaryBtn}
              onPress={() => setCityOpen(false)}
            >
              <Text style={appStyles.primaryBtnText}>{t("common.close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showPhotoModal} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <Text style={appStyles.modalTitle}>{t("profile.updatePhoto")}</Text>

            {photoPreview ? (
              <Image
                source={{ uri: fixImageUrl(photoPreview) }}
                style={{
                  width: 120,
                  height: 120,
                  borderRadius: 60,
                  alignSelf: "center",
                  marginBottom: 20,
                }}
              />
            ) : null}

            <TouchableOpacity
              style={appStyles.primaryBtn}
              onPress={handlePhotoChange}
            >
              <Text style={appStyles.primaryBtnText}>{t("profile.selectImage")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={appStyles.secondaryBtn}
              onPress={() => setShowPhotoModal(false)}
            >
              <Text style={appStyles.secondaryBtnText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showPaymentModal} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <Text style={appStyles.modalTitle}>{t("profile.mockPaymentInfo")}</Text>

            <Text style={appStyles.label}>{t("profile.accountHolder")}</Text>
            <TextInput
              style={appStyles.input}
              value={paymentInfo.account_holder}
              onChangeText={(v) =>
                setPaymentInfo({ ...paymentInfo, account_holder: v })
              }
              placeholder={t("profile.accountHolderPlaceholder")}
            />

            <Text style={appStyles.label}>{t("profile.walletName")}</Text>
            <TextInput
              style={appStyles.input}
              value={paymentInfo.wallet_name}
              onChangeText={(v) =>
                setPaymentInfo({ ...paymentInfo, wallet_name: v })
              }
              placeholder={t("profile.walletNamePlaceholder")}
            />

            <Text style={appStyles.label}>{t("profile.walletNumber")}</Text>
            <TextInput
              style={appStyles.input}
              value={paymentInfo.wallet_number}
              onChangeText={(v) =>
                setPaymentInfo({ ...paymentInfo, wallet_number: v })
              }
              placeholder="0790000000"
              keyboardType="phone-pad"
            />

            <Text style={appStyles.label}>{t("profile.mockAccountNumber")}</Text>
            <TextInput
              style={appStyles.input}
              value={paymentInfo.mock_account_number}
              onChangeText={(v) =>
                setPaymentInfo({ ...paymentInfo, mock_account_number: v })
              }
              placeholder="MOCK-ACC-12345"
            />

            <TouchableOpacity
              style={appStyles.primaryBtn}
              onPress={handleSavePaymentInfo}
            >
              <Text style={appStyles.primaryBtnText}>{t("common.save")}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={appStyles.secondaryBtn}
              onPress={() => setShowPaymentModal(false)}
            >
              <Text style={appStyles.secondaryBtnText}>{t("common.cancel")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal transparent visible={showBalanceModal} animationType="fade">
        <View style={appStyles.modalOverlay}>
          <View style={appStyles.modalBox}>
            <Text style={appStyles.modalTitle}>{t("profile.myBalance")}</Text>

            <Text style={appStyles.text}>
              {t("profile.totalEarnings")}: {Number(balance.totalEarnings || 0).toFixed(2)} JOD
            </Text>
            <Text style={appStyles.text}>
              {t("profile.payments")}: {balance.totalPayments || 0}
            </Text>
            <Text style={appStyles.text}>
              {t("profile.wallet")}: {balance.paymentInfo?.wallet_name || "-"}
            </Text>
            <Text style={appStyles.text}>
              {t("profile.walletNumber")}: {balance.paymentInfo?.wallet_number || "-"}
            </Text>

            <TouchableOpacity
              style={appStyles.primaryBtn}
              onPress={() => setShowBalanceModal(false)}
            >
              <Text style={appStyles.primaryBtnText}>{t("common.close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <FloatingActions navigation={navigation} />
    </SafeAreaView>
  );
}

export default UserProfile;
