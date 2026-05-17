import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getToken } from "../../services/auth.service.jsx";
import Header from "../../components/common/Header";
import axios from "axios";

function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "#546e7a", fontWeight: 600 }}>{label}:</span>
      <strong style={{ color: "#263238" }}>{value}</strong>
    </div>
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

  const API = useMemo(
    () =>
      axios.create({
        baseURL: "http://localhost:5000/api",
        headers: { Authorization: `Bearer ${getToken()}` },
      }),
    []
  );

  const fetchServices = useCallback(async () => {
    try {
      const res = await API.get("/admin/services");
      setServices(res.data || []);
    } catch (error) {
      console.log(error.response?.data?.message || error.message);
    }
  }, [API]);

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
      alert(error.response?.data?.message || error.message);
    }
  }, [API, view]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const resetForm = () => {
    setForm(emptyForm);
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      await API.delete(`/admin/users/${userId}`);
      setSelectedProfile(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteTechnician = async (technicianId) => {
    if (!window.confirm("Are you sure you want to delete this technician?")) return;

    try {
      await API.delete(`/admin/technicians/${technicianId}`);
      setSelectedProfile(null);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteStore = async (storeId) => {
    if (!window.confirm("Are you sure you want to delete this store?")) return;

    try {
      await API.delete(`/admin/stores/${storeId}`);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const handleDeleteService = async (serviceId) => {
    if (!window.confirm("Are you sure you want to delete this service?")) return;

    try {
      await API.delete(`/admin/services/${serviceId}`);
      fetchData();
      fetchServices();
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
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
      alert("Added successfully.");
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  const getAddTitle = () => {
    if (view === "users") return "Add User";
    if (view === "technicians") return "Add Technician";
    if (view === "stores") return "Add Store";
    return "Add Service";
  };

  return (
    <>
      <Header />

      <div className="container">
        <h2>Admin Dashboard</h2>

        <div
          style={{
            marginBottom: "20px",
            display: "flex",
            gap: "10px",
            flexWrap: "wrap",
          }}
        >
          <button className="primary" onClick={() => setView("users")}>
            Manage Users
          </button>

          <button className="secondary" onClick={() => setView("technicians")}>
            Manage Technicians
          </button>

          <button className="secondary" onClick={() => setView("stores")}>
            Manage Stores
          </button>

          <button className="secondary" onClick={() => setView("services")}>
            Manage Services
          </button>
        </div>

        {view === "users" ? (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table className="card" style={{ width: "100%", minWidth: 750 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
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
                    <td>{u.city || "-"}</td>
                    <td>{u.role}</td>
                    <td>
                      <button
                        className="btn-outline"
                        onClick={() => setSelectedProfile({ type: "user", data: u })}
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <button className="btn-outline" onClick={() => handleDeleteUser(u.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {view === "technicians" ? (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table className="card" style={{ width: "100%", minWidth: 950 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Service</th>
                  <th>Service Image</th>
                  <th>Experience</th>
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
                    <td>{t.city || "-"}</td>
                    <td>{t.service || "-"}</td>
                    <td>
                      {t.service_image ? (
                        <img
                          src={`http://localhost:5000${t.service_image}`}
                          alt={t.service}
                          style={{
                            width: 46,
                            height: 46,
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                      ) : (
                        "-"
                      )}
                    </td>
                    <td>{t.experience} yrs</td>
                    <td>
                      <button
                        className="btn-outline"
                        onClick={() => setSelectedProfile({ type: "technician", data: t })}
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-outline"
                        onClick={() => handleDeleteTechnician(t.technicianId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {view === "stores" ? (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table className="card" style={{ width: "100%", minWidth: 850 }}>
              <thead>
                <tr>
                  <th>Store Name</th>
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
                    <td>{s.owner_name || "-"}</td>
                    <td>
                      <button className="btn-outline" onClick={() => handleDeleteStore(s.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        {view === "services" ? (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table className="card" style={{ width: "100%", minWidth: 650 }}>
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
                      <img
                        src={`http://localhost:5000${s.image_url}`}
                        alt={s.name}
                        style={{
                          width: 55,
                          height: 55,
                          borderRadius: "50%",
                          objectFit: "cover",
                          border: "2px solid #111",
                          background: "#fff",
                        }}
                      />
                    </td>
                    <td>{s.name}</td>
                    <td>{s.image_url}</td>
                    <td>
                      <button className="btn-outline" onClick={() => handleDeleteService(s.id)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}

        <div className="panel admin-form">
          <h3 className="section-title">{getAddTitle()}</h3>

          {view === "users" || view === "technicians" ? (
            <>
              <div className="input-group">
                <label>Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Full name"
                />
              </div>

              <div className="input-group">
                <label>Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="Email address"
                />
              </div>

              <div className="input-group">
                <label>Phone</label>
                <input
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>

              <div className="input-group">
                <label>City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                />
              </div>

              <div className="input-group">
                <label>Temporary Password</label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Set a password"
                />
              </div>
            </>
          ) : null}

          {view === "technicians" ? (
            <>
              <div className="input-group">
                <label>Service</label>
                <select
                  value={form.service_id}
                  onChange={(e) => setForm({ ...form, service_id: e.target.value })}
                >
                  <option value="">Select a service</option>
                  {services.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label>Experience (years)</label>
                <input
                  type="number"
                  value={form.experience}
                  onChange={(e) => setForm({ ...form, experience: e.target.value })}
                  placeholder="0"
                />
              </div>
            </>
          ) : null}

          {view === "stores" ? (
            <>
              <div className="input-group">
                <label>Store Name</label>
                <input
                  value={form.store_name}
                  onChange={(e) => setForm({ ...form, store_name: e.target.value })}
                  placeholder="Store name"
                />
              </div>

              <div className="input-group">
                <label>Category</label>
                <input
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  placeholder="Tools, Parts, Electrical..."
                />
              </div>

              <div className="input-group">
                <label>City</label>
                <input
                  value={form.city}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="City"
                />
              </div>

              <div className="input-group">
                <label>Address</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  placeholder="Address"
                />
              </div>

              <div className="input-group">
                <label>Owner User ID</label>
                <input
                  type="number"
                  value={form.owner_id}
                  onChange={(e) => setForm({ ...form, owner_id: e.target.value })}
                  placeholder="Optional"
                />
              </div>
            </>
          ) : null}

          {view === "services" ? (
            <>
              <div className="input-group">
                <label>Service Name</label>
                <input
                  value={form.service_name}
                  onChange={(e) => setForm({ ...form, service_name: e.target.value })}
                  placeholder="Example: Cleaning"
                />
              </div>

              <div className="input-group">
                <label>Image URL</label>
                <input
                  value={form.image_url}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                  placeholder="/images/services/cleaning.png"
                />
              </div>
            </>
          ) : null}

          <button className="primary" onClick={handleAdd}>
            Add
          </button>
        </div>
      </div>

      {selectedProfile ? (
        <div
          onClick={() => setSelectedProfile(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 16,
            zIndex: 9999,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(520px, 95vw)",
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 18px 60px rgba(0,0,0,0.25)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                padding: 14,
                background: "#f5f7fa",
                borderBottom: "1px solid #e6e8eb",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                fontWeight: 800,
              }}
            >
              <span>
                {selectedProfile.type === "user" ? "User Profile" : "Technician Profile"}
              </span>

              <button className="btn-outline" onClick={() => setSelectedProfile(null)}>
                Close
              </button>
            </div>

            <div style={{ padding: 16 }}>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: "50%",
                    background: "#e3f2fd",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 22,
                    fontWeight: 900,
                    color: "#1565c0",
                    flexShrink: 0,
                  }}
                >
                  {String(selectedProfile.data.name || "?").trim().charAt(0).toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 18, fontWeight: 900 }}>
                    {selectedProfile.data.name}
                  </div>

                  <div style={{ color: "#607d8b", fontSize: 13 }}>
                    {selectedProfile.type === "technician" ? "Technician" : "User"}
                  </div>
                </div>
              </div>

              <div
                style={{
                  marginTop: 14,
                  background: "#f1f5f9",
                  borderRadius: 14,
                  padding: 14,
                  display: "grid",
                  gap: 10,
                }}
              >
                <InfoRow label="Email" value={selectedProfile.data.email} />
                <InfoRow label="Phone" value={selectedProfile.data.phone || "-"} />
                <InfoRow label="City" value={selectedProfile.data.city || "-"} />

                {selectedProfile.type === "technician" ? (
                  <>
                    <InfoRow label="Service" value={selectedProfile.data.service || "-"} />
                    <InfoRow
                      label="Experience"
                      value={`${selectedProfile.data.experience || 0} yrs`}
                    />
                  </>
                ) : null}
              </div>

              <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                {selectedProfile.type === "user" ? (
                  <button
                    className="btn-outline"
                    onClick={() => handleDeleteUser(selectedProfile.data.id)}
                  >
                    Delete User
                  </button>
                ) : (
                  <button
                    className="btn-outline"
                    onClick={() =>
                      handleDeleteTechnician(selectedProfile.data.technicianId)
                    }
                  >
                    Delete Technician
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default AdminDashboard;