import React, { useCallback, useEffect, useState } from "react";
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
  return String(value).split("T")[0];
}

function AdminDashboard() {
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
      alert("Added successfully.");
    } catch (err) {
      alert(err?.response?.data?.message || err.message);
    }
  };

  const handleDelete = async (type, id) => {
    if (!window.confirm("Are you sure?")) return;

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
      <option value="">Select city</option>
      {JORDAN_CITIES.map((city) => (
        <option key={city} value={city}>
          {city}
        </option>
      ))}
    </select>
  );

  const ServiceSelect = ({ value, onChange, placeholder = "Select service" }) => (
    <select value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">{placeholder}</option>
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
        <h2>Admin Dashboard</h2>

        <div className="admin-actions">
          <button className={activeClass("users")} onClick={() => changeView("users")}>
            Manage Users
          </button>
          <button className={activeClass("technicians")} onClick={() => changeView("technicians")}>
            Manage Technicians
          </button>
          <button className={activeClass("stores")} onClick={() => changeView("stores")}>
            Manage Stores
          </button>
          <button className={activeClass("services")} onClick={() => changeView("services")}>
            Manage Services
          </button>
        </div>

        {loading ? <div className="panel">Loading...</div> : null}

        {view === "users" && (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Birth Date</th>
                <th>City</th>
                <th>Role</th>
                <th>View</th>
                <th>Delete</th>
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
                    <button className="btn-outline" onClick={() => setSelectedProfile({ type: "user", data: u })}>
                      View
                    </button>
                  </td>
                  <td>
                    <button className="btn-outline" onClick={() => handleDelete("user", u.id)}>
                      Delete
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
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Birth Date</th>
                <th>City</th>
                <th>Service</th>
                <th>Exp</th>
                <th>Price/hr</th>
                <th>View</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {technicians.map((t) => (
                <tr key={t.technicianId}>
                  <td>{t.name}</td>
                  <td>{t.email}</td>
                  <td>{t.phone || "-"}</td>
                  <td>{formatDate(t.dob) || "-"}</td>
                  <td>{t.city || "-"}</td>
                  <td>{t.service || t.service_name || "-"}</td>
                  <td>{t.experience || 0}</td>
                  <td>{Number(t.price_per_hour || 0).toFixed(2)}</td>
                  <td>
                    <button className="btn-outline" onClick={() => setSelectedProfile({ type: "technician", data: t })}>
                      View
                    </button>
                  </td>
                  <td>
                    <button className="btn-outline" onClick={() => handleDelete("technician", t.technicianId)}>
                      Delete
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
                <th>Store</th>
                <th>Category</th>
                <th>City</th>
                <th>Address</th>
                <th>Owner</th>
                <th>Delete</th>
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
                    <button className="btn-outline" onClick={() => handleDelete("store", s.id)}>
                      Delete
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
                <th>Image</th>
                <th>Service Name</th>
                <th>Image URL</th>
                <th>Delete</th>
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
                        style={{ width: 55, height: 55, borderRadius: "50%", objectFit: "cover" }}
                      />
                    ) : (
                      "-"
                    )}
                  </td>
                  <td>{s.name}</td>
                  <td>{s.image_url}</td>
                  <td>
                    <button className="btn-outline" onClick={() => handleDelete("service", s.id)}>
                      Delete
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
              ? "Add User"
              : view === "technicians"
              ? "Add Technician"
              : view === "stores"
              ? "Add Store"
              : "Add Service"}
          </h3>

          {(view === "users" || view === "technicians") && (
            <>
              <div className="input-group">
                <label>Name</label>
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>

              <div className="input-group">
                <label>Phone</label>
                <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>

              <div className="input-group">
                <label>Birth Date</label>
                <input type="date" value={form.dob} onChange={(e) => setForm({ ...form, dob: e.target.value })} />
              </div>

              <div className="input-group">
                <label>City</label>
                <CitySelect value={form.city} onChange={(city) => setForm({ ...form, city })} />
              </div>

              <div className="input-group">
                <label>Password</label>
                <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
              </div>
            </>
          )}

          {view === "technicians" && (
            <>
              <div className="input-group">
                <label>Service</label>
                <ServiceSelect value={form.service_id} onChange={(service_id) => setForm({ ...form, service_id })} />
              </div>

              <div className="input-group">
                <label>Experience</label>
                <input type="number" value={form.experience} onChange={(e) => setForm({ ...form, experience: e.target.value })} />
              </div>

              <div className="input-group">
                <label>Price Per Hour</label>
                <input type="number" value={form.price_per_hour} onChange={(e) => setForm({ ...form, price_per_hour: e.target.value })} />
              </div>
            </>
          )}

          {view === "stores" && (
            <>
              <div className="input-group">
                <label>Store Name</label>
                <input value={form.store_name} onChange={(e) => setForm({ ...form, store_name: e.target.value })} />
              </div>

              <div className="input-group">
                <label>Category</label>
                <ServiceSelect value={form.category} onChange={(category) => setForm({ ...form, category })} placeholder="Select category" />
              </div>

              <div className="input-group">
                <label>City</label>
                <CitySelect value={form.city} onChange={(city) => setForm({ ...form, city })} />
              </div>

              <div className="input-group">
                <label>Address</label>
                <input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
              </div>

              <div className="input-group">
                <label>Owner User ID</label>
                <input value={form.owner_id} onChange={(e) => setForm({ ...form, owner_id: e.target.value })} />
              </div>
            </>
          )}

          {view === "services" && (
            <>
              <div className="input-group">
                <label>Service Name</label>
                <input value={form.service_name} onChange={(e) => setForm({ ...form, service_name: e.target.value })} />
              </div>

              <div className="input-group">
                <label>Image URL</label>
                <input value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
              </div>
            </>
          )}

          <button className="primary" onClick={handleAdd}>Add</button>
        </div>
      </div>

      {selectedProfile ? (
        <div className="admin-profile-overlay">
          <div className="admin-profile-modal">
            <div className="admin-profile-header">
              <div>
                <h3>{selectedProfile.type === "user" ? "User Profile" : "Technician Profile"}</h3>
                <p>{selectedProfile.data.role || selectedProfile.type}</p>
              </div>

              <button className="btn-outline" onClick={() => setSelectedProfile(null)}>
                Close
              </button>
            </div>

            <div className="admin-profile-grid">
              <div className="admin-profile-item"><b>Name</b>{selectedProfile.data.name || "-"}</div>
              <div className="admin-profile-item"><b>Email</b>{selectedProfile.data.email || "-"}</div>
              <div className="admin-profile-item"><b>Phone</b>{selectedProfile.data.phone || "-"}</div>
              <div className="admin-profile-item"><b>Birth Date</b>{formatDate(selectedProfile.data.dob) || "-"}</div>
              <div className="admin-profile-item"><b>City</b>{selectedProfile.data.city || "-"}</div>

              {selectedProfile.type === "technician" ? (
                <>
                  <div className="admin-profile-item"><b>Service</b>{selectedProfile.data.service || "-"}</div>
                  <div className="admin-profile-item"><b>Experience</b>{selectedProfile.data.experience || 0} years</div>
                  <div className="admin-profile-item"><b>Price/hr</b>{Number(selectedProfile.data.price_per_hour || 0).toFixed(2)} JOD</div>
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