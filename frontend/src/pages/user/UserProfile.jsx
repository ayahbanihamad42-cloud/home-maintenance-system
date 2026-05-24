import React, { useEffect, useRef, useState } from "react";
import Header from "../../components/common/Header";
import API from "../../services/api";
import TechnicianProfileGallery from "../technician/TechnicianGalleryManager";
import {
  getMyPaymentInfo,
  saveMyPaymentInfo,
  getMyBalance,
} from "../../services/paymentService";

function UserProfile() {
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

      const savedPhoto = localStorage.getItem(`profile_photo_${currentUser.id}`);
      if (savedPhoto) setPhotoPreview(savedPhoto);

      const role = String(data.role || currentUser.role || "").toLowerCase();

      if (role === "technician") {
        await loadTechnicianGalleryId(data);
      } else {
        setTechnicianGalleryId("");
      }
    } catch (err) {
      setProfileMessage({
        type: "error",
        title: "Error",
        body: "Failed to load profile.",
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

  const openSoonMessage = (name) => {
    setMenuOpen(false);
    setSubmenu(null);

    setProfileMessage({
      type: "warning",
      title: name,
      body: "We will add this feature soon.",
    });
  };

  const handleSaveProfile = async () => {
    try {
      const payload = { email, phone, city, dob };

      await API.patch(`/users/${currentUser.id}`, payload);

      try {
        await API.post("/users/send-profile-update-email", {
          userId: currentUser.id,
          ...payload,
        });
      } catch {}

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
        })
      );

      setShowEditModal(false);

      setProfileMessage({
        type: "success",
        title: "Saved Successfully",
        body: "Profile updated successfully and we sent an email.",
      });
    } catch (err) {
      setProfileMessage({
        type: "error",
        title: "Error",
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
        title: "Payment Info Saved",
        body: "Your mock wallet information was saved successfully.",
      });
    } catch (err) {
      setProfileMessage({
        type: "error",
        title: "Error",
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
        title: "My Balance",
        body: `Total earnings: ${Number(data.totalEarnings || 0).toFixed(
          2
        )} JOD | Payments: ${data.totalPayments || 0} | Wallet: ${
          info?.wallet_name || "-"
        } | Wallet number: ${info?.wallet_number || "-"}`,
      });
    } catch (err) {
      setProfileMessage({
        type: "error",
        title: "Error",
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

    reader.onloadend = () => {
      localStorage.setItem(`profile_photo_${currentUser.id}`, reader.result);
      setPhotoPreview(reader.result);
      setShowPhotoModal(false);

      setProfileMessage({
        type: "success",
        title: "Saved Successfully",
        body: "Profile photo updated successfully.",
      });
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
              <div className="message-box-title">Error</div>
              <div className="message-box-body">User id is missing.</div>
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
              <p>Loading...</p>
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
                    Edit Contact
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowPhotoModal(true);
                      setMenuOpen(false);
                      setSubmenu(null);
                    }}
                  >
                    Edit Photo
                  </button>

                  {isTechnician && (
                    <>
                      <button type="button" onClick={openPaymentModal}>
                        Payment Info
                      </button>

                      <button type="button" onClick={handleShowBalance}>
                        My Balance
                      </button>
                    </>
                  )}

                  <button
                    type="button"
                    onClick={() =>
                      setSubmenu(submenu === "language" ? null : "language")
                    }
                  >
                    Language ▸
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setSubmenu(submenu === "theme" ? null : "theme")
                    }
                  >
                    Theme ▸
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
                      <button type="button" onClick={() => openSoonMessage("Arabic")}>
                        Arabic
                      </button>

                      <button type="button" onClick={() => openSoonMessage("English")}>
                        English
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
                      <button type="button" onClick={() => openSoonMessage("Light Theme")}>
                        Light
                      </button>

                      <button type="button" onClick={() => openSoonMessage("Dark Theme")}>
                        Dark
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
              <b>Email:</b> {profile.email || "-"}
            </p>
            <p>
              <b>Phone:</b> {profile.phone || "-"}
            </p>
            <p>
              <b>City:</b> {profile.city || "-"}
            </p>
            <p>
              <b>Birth Date:</b> {formatDate(profile.dob) || "-"}
            </p>
          </div>

          {isTechnician && (
            <div className="profile-gallery-section" style={{ marginTop: "28px" }}>
              {technicianGalleryId ? (
                <TechnicianProfileGallery technicianId={technicianGalleryId} />
              ) : (
                <div className="message-box-card warning">
                  <div className="message-box-title">Gallery</div>
                  <div className="message-box-body">
                    Technician gallery id is missing. Please make sure the backend
                    returns technician_id for this technician user.
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
            <h3>Update Contact</h3>

            <div className="input-group">
              <label>Email</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>

            <div className="input-group">
              <label>City</label>
              <input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>

            <div className="input-group">
              <label>Birth Date</label>
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
                Cancel
              </button>

              <button className="primary" type="button" onClick={handleSaveProfile}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {showPhotoModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Update Photo</h3>

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
              <label>Select Image</label>
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
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Mock Payment Info</h3>

            <div className="input-group">
              <label>Account Holder</label>
              <input
                value={paymentInfo.account_holder}
                onChange={(e) =>
                  setPaymentInfo({
                    ...paymentInfo,
                    account_holder: e.target.value,
                  })
                }
                placeholder="Technician name"
              />
            </div>

            <div className="input-group">
              <label>Wallet Name</label>
              <input
                value={paymentInfo.wallet_name}
                onChange={(e) =>
                  setPaymentInfo({
                    ...paymentInfo,
                    wallet_name: e.target.value,
                  })
                }
                placeholder="Example: CliQ / Zain Cash"
              />
            </div>

            <div className="input-group">
              <label>Wallet Number</label>
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
              <label>Mock Account Number</label>
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
                Cancel
              </button>

              <button
                className="primary"
                type="button"
                onClick={handleSavePaymentInfo}
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default UserProfile;