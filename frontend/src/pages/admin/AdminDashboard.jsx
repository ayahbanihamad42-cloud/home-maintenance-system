import React, { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import Header from "../../components/common/Header";
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
} from "../../services/adminService.jsx";

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
  const raw = String(value).trim();
  const match = raw.match(/^(\d{4}-\d{2}-\d{2})/);
  if (match) return match[1];
  return raw.slice(0, 10);
}

function AdminDashboard() {
  const { t } = useTranslation();
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
      alert(err?.response?.data?.message || err.message);
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

  const handleServiceImageFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onloadend = () => {
      setForm((prev) => ({
        ...prev,
        image_base64: reader.result,
        image_url: "",
      }));
    };

    reader.readAsDataURL(file);
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
          image_base64: form.image_base64,
        });
      }

      resetForm();
      await loadData();
      await loadServices();
      alert(t("admin.addedSuccess"));
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm(t("admin.areYouSure"))) return;

    try {
      if (type === "user") await deleteAdminUser(id);
      if (type === "technician") await deleteAdminTechnician(id);
      if (type === "store") await deleteAdminStore(id);
      if (type === "service") await deleteAdminService(id);

      setSelectedProfile(null);
      await loadData();
      await loadServices();
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const changeView = (nextView) => {
    setView(nextView);
    resetForm();
    setSelectedProfile(null);
  };

  const activeClass = (name) => (view === name ? "primary" : "btn-outline");

  const CitySelect = ({ value, onChange }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{t("admin.selectCity")}</option>
      {JORDAN_CITIES.map((city) => (
        <option key={city} value={city}>
          {city}
        </option>
      ))}
    </select>
  );

  const ServiceSelect = ({ value, onChange, placeholder }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder || t("admin.selectService")}</option>
      {services.map((s) => (
        <option key={s.id} value={s.id}>
          {s.name}
        </option>
      ))}
    </select>
  );

  return (
    <>
      <Header />

      <div className="container">
        <h2>{t("admin.title")}</h2>

        <div className="admin-actions">
          <button
            className={activeClass("users")}
            onClick={() => changeView("users")}
          >
            {t("admin.manageUsers")}
          </button>

          <button
            className={activeClass("technicians")}
            onClick={() => changeView("technicians")}
          >
            {t("admin.manageTechnicians")}
          </button>

          <button
            className={activeClass("stores")}
            onClick={() => changeView("stores")}
          >
            {t("admin.manageStores")}
          </button>

          <button
            className={activeClass("services")}
            onClick={() => changeView("services")}
          >
            {t("admin.manageServices")}
          </button>
        </div>

        {loading ? <div className="panel">{t("admin.loading")}</div> : null}

        {view === "users" && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.name")}</th>
                <th>{t("admin.email")}</th>
                <th>{t("admin.phone")}</th>
                <th>{t("admin.birthDate")}</th>
                <th>{t("admin.city")}</th>
                <th>{t("admin.role")}</th>
                <th>{t("admin.view")}</th>
                <th>{t("admin.delete")}</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone || "-"}</td>
                  <td>{formatDate(u.dob) || "-"}</td>
                  <td>{u.city || "-"}</td>
                  <td>{u.role}</td>
                  <td>
                    <button
                      className="btn-outline"
                      onClick={() =>
                        setSelectedProfile({ type: "user", data: u })
                      }
                    >
                      {t("admin.view")}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-outline"
                      onClick={() => handleDelete("user", u.id)}
                    >
                      {t("admin.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {view === "technicians" && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.name")}</th>
                <th>{t("admin.email")}</th>
                <th>{t("admin.phone")}</th>
                <th>{t("admin.birthDate")}</th>
                <th>{t("admin.city")}</th>
                <th>{t("admin.service")}</th>
                <th>{t("admin.experience")}</th>
                <th>{t("admin.pricePerHour")}</th>
                <th>{t("admin.view")}</th>
                <th>{t("admin.delete")}</th>
              </tr>
            </thead>

            <tbody>
              {technicians.map((tech) => (
                <tr key={tech.technicianId}>
                  <td>{tech.name}</td>
                  <td>{tech.email}</td>
                  <td>{tech.phone || "-"}</td>
                  <td>{formatDate(tech.dob) || "-"}</td>
                  <td>{tech.city || "-"}</td>
                  <td>{tech.service || tech.service_name || "-"}</td>
                  <td>{tech.experience || 0}</td>
                  <td>{Number(tech.price_per_hour || 0).toFixed(2)}</td>
                  <td>
                    <button
                      className="btn-outline"
                      onClick={() =>
                        setSelectedProfile({
                          type: "technician",
                          data: tech,
                        })
                      }
                    >
                      {t("admin.view")}
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn-outline"
                      onClick={() =>
                        handleDelete("technician", tech.technicianId)
                      }
                    >
                      {t("admin.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {view === "stores" && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.store")}</th>
                <th>{t("admin.category")}</th>
                <th>{t("admin.city")}</th>
                <th>{t("admin.address")}</th>
                <th>{t("admin.owner")}</th>
                <th>{t("admin.delete")}</th>
              </tr>
            </thead>

            <tbody>
              {stores.map((s) => (
                <tr key={s.id}>
                  <td>{s.store_name}</td>
                  <td>{s.category}</td>
                  <td>{s.city}</td>
                  <td>{s.address || "-"}</td>
                  <td>{s.owner_name || s.owner_id || "-"}</td>
                  <td>
                    <button
                      className="btn-outline"
                      onClick={() => handleDelete("store", s.id)}
                    >
                      {t("admin.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {view === "services" && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>{t("admin.image")}</th>
                <th>{t("admin.serviceName")}</th>
                <th>{t("admin.imageUrl")}</th>
                <th>{t("admin.delete")}</th>
              </tr>
            </thead>

            <tbody>
              {services.map((s) => (
                <tr key={s.id}>
                  <td>
                    {s.image_url ? (
                      <img
                        src={getBackendImageUrl(s.image_url)}
                        alt={s.name}
                        style={{
                          width: 55,
                          height: 55,
                          borderRadius: "50%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{s.name}</td>
                  <td>{s.image_url}</td>
                  <td>
                    <button
                      className="btn-outline"
                      onClick={() => handleDelete("service", s.id)}
                    >
                      {t("admin.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <div className="panel admin-form">
          <h3>
            {view === "users"
              ? t("admin.addUser")
              : view === "technicians"
              ? t("admin.addTechnician")
              : view === "stores"
              ? t("admin.addStore")
              : t("admin.addService")}
          </h3>

          {(view === "users" || view === "technicians") && (
            <>
              <div className="input-group">
                <label>{t("admin.name")}</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>{t("admin.email")}</label>
                <input
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>{t("admin.phone")}</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>{t("admin.birthDate")}</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => setForm({ ...form, dob: e.target.value })}
                />
              </div>

              <div className="input-group">
                <label>{t("admin.city")}</label>
                <CitySelect
                  value={form.city}
                  onChange={(city) => setForm({ ...form, city })}
                />
              </div>

              <div className="input-group">
                <label>{t("admin.password")}</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {view === "technicians" && (
            <>
              <div className="input-group">
                <label>{t("admin.service")}</label>
                <ServiceSelect
                  value={form.service_id}
                  onChange={(service_id) =>
                    setForm({ ...form, service_id })
                  }
                />
              </div>

              <div className="input-group">
                <label>{t("admin.experienceFull")}</label>
                <input
                  type="number"
                  value={form.experience}
                  onChange={(e) =>
                    setForm({ ...form, experience: e.target.value })
                  }
                />
              </div>

              <div className="input-group">
                <label>{t("admin.pricePerHourFull")}</label>
                <input
                  type="number"
                  value={form.price_per_hour}
                  onChange={(e) =>
                    setForm({ ...form, price_per_hour: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {view === "stores" && (
            <>
              <div className="input-group">
                <label>{t("admin.storeName")}</label>
                <input
                  value={form.store_name}
                  onChange={(e) =>
                    setForm({ ...form, store_name: e.target.value })
                  }
                />
              </div>

              <div className="input-group">
                <label>{t("admin.category")}</label>
                <ServiceSelect
                  value={form.category}
                  onChange={(category) =>
                    setForm({ ...form, category })
                  }
                  placeholder={t("admin.selectCategory")}
                />
              </div>

              <div className="input-group">
                <label>{t("admin.city")}</label>
                <CitySelect
                  value={form.city}
                  onChange={(city) => setForm({ ...form, city })}
                />
              </div>

              <div className="input-group">
                <label>{t("admin.address")}</label>
                <input
                  value={form.address}
                  onChange={(e) =>
                    setForm({ ...form, address: e.target.value })
                  }
                />
              </div>

              <div className="input-group">
                <label>{t("admin.ownerUserId")}</label>
                <input
                  value={form.owner_id}
                  onChange={(e) =>
                    setForm({ ...form, owner_id: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {view === "services" && (
            <>
              <div className="input-group">
                <label>{t("admin.serviceName")}</label>
                <input
                  value={form.service_name}
                  onChange={(e) =>
                    setForm({ ...form, service_name: e.target.value })
                  }
                />
              </div>

              <div className="input-group">
                <label>{t("admin.serviceImage")}</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleServiceImageFile}
                />
              </div>

              {form.image_base64 ? (
                <div style={{ marginTop: 10 }}>
                  <img
                    src={form.image_base64}
                    alt="preview"
                    style={{
                      width: 90,
                      height: 90,
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: "1px solid #ddd",
                    }}
                  />
                </div>
              ) : null}
            </>
          )}

          <button className="primary" onClick={handleAdd}>
            {t("admin.add")}
          </button>
        </div>
      </div>

      {selectedProfile ? (
        <div className="admin-profile-overlay">
          <div className="admin-profile-modal">
            <div className="admin-profile-header">
              <div>
                <h3>
                  {selectedProfile.type === "user"
                    ? t("admin.userProfile")
                    : t("admin.technicianProfile")}
                </h3>
                <p>{selectedProfile.data.role || selectedProfile.type}</p>
              </div>

              <button
                className="btn-outline"
                onClick={() => setSelectedProfile(null)}
              >
                {t("admin.close")}
              </button>
            </div>

            <div className="admin-profile-grid">
              <div className="admin-profile-item">
                <b>{t("admin.name")}</b>
                {selectedProfile.data.name || "-"}
              </div>

              <div className="admin-profile-item">
                <b>{t("admin.email")}</b>
                {selectedProfile.data.email || "-"}
              </div>

              <div className="admin-profile-item">
                <b>{t("admin.phone")}</b>
                {selectedProfile.data.phone || "-"}
              </div>

              <div className="admin-profile-item">
                <b>{t("admin.birthDate")}</b>
                {formatDate(selectedProfile.data.dob) || "-"}
              </div>

              <div className="admin-profile-item">
                <b>{t("admin.city")}</b>
                {selectedProfile.data.city || "-"}
              </div>

              {selectedProfile.type === "technician" ? (
                <>
                  <div className="admin-profile-item">
                    <b>{t("admin.service")}</b>
                    {selectedProfile.data.service || "-"}
                  </div>

                  <div className="admin-profile-item">
                    <b>{t("admin.experienceFull")}</b>
                    {selectedProfile.data.experience || 0} {t("admin.yearsUnit")}
                  </div>

                  <div className="admin-profile-item">
                    <b>{t("admin.pricePerHour")}</b>
                    {Number(selectedProfile.data.price_per_hour || 0).toFixed(
                      2
                    )}{" "}
                    {t("admin.jodUnit")}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default AdminDashboard;