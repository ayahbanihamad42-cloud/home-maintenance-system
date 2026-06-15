import React, { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../Context/ThemeContext";
import Header from "../../components/common/Header";
import API from "../../services/api";
import TechnicianProfileGallery from "../technician/TechnicianGalleryManager";
import {
  getMyPaymentInfo,
  saveMyPaymentInfo,
  getMyBalance,
} from "../../services/paymentService";

function UserProfile() {
  const { t, i18n } = useTranslation();
  const { toggleTheme } = useTheme();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [profile, setProfile] = useState(null);
  const [technicianGalleryId, setTechnicianGalleryId] = useState("");

  const [menuOpen, setMenuOpen] = useState(false);
  const [submenu, setSubmenu] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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

  const fileInputRef = useRef(null);

  const formatDate = (value) => {
    if (!value) return "";

    const raw = String(value).trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) {
      return raw;
    }

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

  const loadTechnicianGalleryId = async (profileData) => {
    const directId =
      getTechnicianIdFromData(profileData) ||
      getTechnicianIdFromData(currentUser);

    if (directId) {
      setTechnicianGalleryId(directId);
      return;
    }

    const possibleUrls = [
      `/technicians/me`,
      `/technicians/user/${currentUser.id}`,
      `/technicians/by-user/${currentUser.id}`,
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
      } catch (err) {}
    }

    setTechnicianGalleryId("");
  };

  const loadProfile = async () => {
    try {
      setProfileMessage(null);

      const res = await API.get(`/users/${currentUser.id}`);
      const data = res.data || {};

      setProfile(data);

      setEmail(data.email || "");
      setPhone(data.phone || "");
      setCity(data.city || "");
      setDob(formatDate(data.dob));
      setPhotoPreview(getProfilePhoto(data));

      const role = String(data.role || currentUser.role || "").toLowerCase();

      if (role === "technician") {
        await loadTechnicianGalleryId(data);
      } else {
        setTechnicianGalleryId("");
      }
    } catch (err) {
      setProfileMessage({
        type: "error",
        title: t("profile.error"),
        body: t("profile.failedToLoadProfile"),
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
    if (currentUser?.id) loadProfile();
  }, [currentUser?.id]);


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

      localStorage.setItem(
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
        title: t("profile.savedSuccessfully"),
        body: t("profile.profileUpdated"),
      });

      await loadProfile();
    } catch (err) {
      setProfileMessage({
        type: "error",
        title: t("profile.error"),
        body: err.response?.data?.message || "Failed to update profile.",
      });
    }
  };

  const handleSavePaymentInfo = async () => {
    try {
      await saveMyPaymentInfo(paymentInfo);

      setShowPaymentModal(false);

      setProfileMessage({
        type: "success",
        title: t("profile.paymentInfoSaved"),
        body: t("profile.walletInfoSaved"),
      });
    } catch (err) {
      setProfileMessage({
        type: "error",
        title: t("profile.error"),
        body: err.response?.data?.message || "Failed to save payment info.",
      });
    }
  };

  const handleShowBalance = async () => {
    try {
      setMenuOpen(false);
      setSubmenu(null);

      const data = await getMyBalance();
      const info = data.paymentInfo;

      setProfileMessage({
        type: "success",
        title: t("profile.myBalance"),
        body: `Total earnings: ${Number(data.totalEarnings || 0).toFixed(
          2
        )} JOD | Payments: ${data.totalPayments || 0} | Wallet: ${
          info?.wallet_name || "-"
        } | Wallet number: ${info?.wallet_number || "-"}`,
      });
    } catch (err) {
      setProfileMessage({
        type: "error",
        title: t("profile.error"),
        body: err.response?.data?.message || "Failed to load balance.",
      });
    }
  };

  const openPaymentModal = async () => {
    setMenuOpen(false);
    setSubmenu(null);
    await loadPaymentInfo();
    setShowPaymentModal(true);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = async () => {
      try {
        const base64Image = reader.result;

        await API.patch(`/users/${currentUser.id}/photo`, {
          profile_image: base64Image,
        });

        const updatedProfile = {
          ...profile,
          profile_image: base64Image,
        };

        setProfile(updatedProfile);
        setPhotoPreview(base64Image);

        localStorage.setItem(
          "user",
          JSON.stringify({
            ...currentUser,
            profile_image: base64Image,
          })
        );

        setShowPhotoModal(false);

        setProfileMessage({
          type: "success",
          title: t("profile.savedSuccessfully"),
          body: t("profile.photoUpdated"),
        });

        await loadProfile();
      } catch (err) {
        setProfileMessage({
          type: "error",
          title: t("profile.error"),
          body: err.response?.data?.message || "Failed to update profile photo.",
        });
      }
    };

    reader.readAsDataURL(file);
  };

  if (!currentUser?.id) {
    return (
      <>
        <Header />
        <div className="profile-container">
          <div className="profile-card">
            <div className="message-box-card error">
              <div className="message-box-title">{t("profile.error")}</div>
              <div className="message-box-body">{t("profile.missingId")}</div>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!profile) {
    return (
      <>
        <Header />
        <div className="profile-container">
          <div className="profile-card">
            {profileMessage ? (
              <div className={`message-box-card ${profileMessage.type}`}>
                <div className="message-box-title">{profileMessage.title}</div>
                <div className="message-box-body">{profileMessage.body}</div>
              </div>
            ) : (
              <p>{t("profile.loading")}</p>
            )}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header-settings">
            <div className="profile-identity">
              <div className="avatar profile-avatar-large">
                {photoPreview ? (
                  <img src={photoPreview} alt="profile" className="avatar-image" />
                ) : (
                  profile.name?.charAt(0)?.toUpperCase()
                )}
              </div>

              <div className="profile-title-block">
                <h2>{profile.name}</h2>
                <span className="role-badge">{profile.role}</span>
              </div>
            </div>

            <div className="profile-settings-wrapper">
              <button
                type="button"
                className="profile-settings-btn"
                onClick={() => {
                  setMenuOpen((prev) => !prev);
                  setSubmenu(null);
                }}
              >
                ⚙
              </button>

              {menuOpen && (
                <div className="profile-settings-menu">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(true);
                      setMenuOpen(false);
                      setSubmenu(null);
                    }}
                  >
                    {t("profile.editContact")}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPhotoModal(true);
                      setMenuOpen(false);
                      setSubmenu(null);
                    }}
                  >
                    {t("profile.editPhoto")}
                  </button>

                  {isTechnician && (
                    <>
                      <button type="button" onClick={openPaymentModal}>
                        {t("profile.paymentInfo")}
                      </button>

                      <button type="button" onClick={handleShowBalance}>
                        {t("profile.myBalance")}
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setSubmenu(submenu === "language" ? null : "language")
                    }
                  >
                    {t("profile.language")}
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSubmenu(submenu === "theme" ? null : "theme")
                    }
                  >
                    {t("profile.theme")}
                  </button>

                  {submenu === "language" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "144px",
                        right: "230px",
                        minWidth: "180px",
                        background: "#fffaf4",
                        border: "1px solid #eadfce",
                        borderRadius: "18px",
                        boxShadow: "0 18px 34px rgba(0,0,0,0.14)",
                        padding: "10px",
                        zIndex: 40,
                      }}
                    >
                      <button type="button" onClick={() => { i18n.changeLanguage("ar"); setMenuOpen(false); setSubmenu(null); }}>
                        {t("profile.arabic")}
                      </button>

                      <button type="button" onClick={() => { i18n.changeLanguage("en"); setMenuOpen(false); setSubmenu(null); }}>
                        {t("profile.english")}
                      </button>
                    </div>
                  )}

                  {submenu === "theme" && (
                    <div
                      style={{
                        position: "absolute",
                        top: "190px",
                        right: "230px",
                        minWidth: "180px",
                        background: "#fffaf4",
                        border: "1px solid #eadfce",
                        borderRadius: "18px",
                        boxShadow: "0 18px 34px rgba(0,0,0,0.14)",
                        padding: "10px",
                        zIndex: 40,
                      }}
                    >
                      <button type="button" onClick={() => { toggleTheme(); setMenuOpen(false); setSubmenu(null); }}>
                        {t("profile.light")}
                      </button>

                      <button type="button" onClick={() => { toggleTheme(); setMenuOpen(false); setSubmenu(null); }}>
                        {t("profile.dark")}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {profileMessage && (
            <div className={`message-box-card ${profileMessage.type}`}>
              <div className="message-box-title">{profileMessage.title}</div>
              <div className="message-box-body">{profileMessage.body}</div>
            </div>
          )}

          <div className="profile-info">
            <p>
              <b>{t("profile.emailLabel")}:</b> {profile.email || "-"}
            </p>
            <p>
              <b>{t("profile.phoneLabel")}:</b> {profile.phone || "-"}
            </p>
            <p>
              <b>{t("profile.cityLabel")}:</b> {profile.city || "-"}
            </p>
            <p>
              <b>{t("profile.birthDateLabel")}:</b> {formatDate(profile.dob) || "-"}
            </p>
          </div>

          {isTechnician && (
            <div className="profile-gallery-section" style={{ marginTop: "28px" }}>
              {technicianGalleryId ? (
                <TechnicianProfileGallery technicianId={technicianGalleryId} />
              ) : (
                <div className="message-box-card warning">
                  <div className="message-box-title">{t("profile.gallery")}</div>
                  <div className="message-box-body">
                    {t("profile.galleryIdMissing")}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showEditModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t("profile.updateContact")}</h3>

            <div className="input-group">
              <label>{t("profile.emailLabel")}</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="input-group">
              <label>{t("profile.phoneLabel")}</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="input-group">
              <label>{t("profile.cityLabel")}</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>

            <div className="input-group">
              <label>{t("profile.birthDateLabel")}</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="modal-actions">
              <button
                className="secondary"
                type="button"
                onClick={() => setShowEditModal(false)}
              >
                {t("profile.cancel")}
              </button>

              <button className="primary" type="button" onClick={handleSaveProfile}>
                {t("profile.save")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPhotoModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t("profile.updatePhoto")}</h3>

            <div className="profile-photo-preview-wrap">
              <div className="avatar profile-avatar-large">
                {photoPreview ? (
                  <img src={photoPreview} alt="preview" className="avatar-image" />
                ) : (
                  profile.name?.charAt(0)?.toUpperCase()
                )}
              </div>
            </div>

            <div className="input-group">
              <label>{t("profile.selectImage")}</label>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
              />
            </div>

            <div className="modal-actions">
              <button
                className="secondary"
                type="button"
                onClick={() => setShowPhotoModal(false)}
              >
                {t("profile.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>{t("profile.mockPaymentInfo")}</h3>

            <div className="input-group">
              <label>{t("profile.accountHolder")}</label>
              <input
                value={paymentInfo.account_holder}
                onChange={(e) =>
                  setPaymentInfo({
                    ...paymentInfo,
                    account_holder: e.target.value,
                  })
                }
                placeholder={t("profile.technicianName")}
              />
            </div>

            <div className="input-group">
              <label>{t("profile.walletName")}</label>
              <input
                value={paymentInfo.wallet_name}
                onChange={(e) =>
                  setPaymentInfo({
                    ...paymentInfo,
                    wallet_name: e.target.value,
                  })
                }
                placeholder="CliQ / Zain Cash"
              />
            </div>

            <div className="input-group">
              <label>{t("profile.walletNumber")}</label>
              <input
                value={paymentInfo.wallet_number}
                onChange={(e) =>
                  setPaymentInfo({
                    ...paymentInfo,
                    wallet_number: e.target.value,
                  })
                }
                placeholder="0790000000"
              />
            </div>

            <div className="input-group">
              <label>{t("profile.mockAccountNumber")}</label>
              <input
                value={paymentInfo.mock_account_number}
                onChange={(e) =>
                  setPaymentInfo({
                    ...paymentInfo,
                    mock_account_number: e.target.value,
                  })
                }
                placeholder="MOCK-ACC-12345"
              />
            </div>

            <div className="modal-actions">
              <button
                className="secondary"
                type="button"
                onClick={() => setShowPaymentModal(false)}
              >
                {t("profile.cancel")}
              </button>

              <button
                className="primary"
                type="button"
                onClick={handleSavePaymentInfo}
              >
                {t("profile.save")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserProfile;