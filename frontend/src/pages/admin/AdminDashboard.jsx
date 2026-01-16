import React, { useCallback, useEffect, useMemo, useState } from "react";
import { getToken } from "../../services/auth.service.jsx";
import Header from "../../components/common/Header";
import axios from "axios";

/* --- helper صغير لعرض سطرين معلومات داخل المودال --- */
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
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    service: "",
    experience: "",
  });

  const serviceOptions = ["Plumbing", "Electrical", "Painting", "Decoration"];

  const API = useMemo(
    () =>
      axios.create({
        baseURL: "http://localhost:5000/api",
        headers: { Authorization: `Bearer ${getToken()}` },
      }),
    []
  );

  const fetchData = useCallback(async () => {
    try {
      if (view === "users") {
        const res = await API.get("/admin/users");
        setUsers(res.data);
      } else {
        const res = await API.get("/admin/technicians");
        setTechnicians(res.data);
      }
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  }, [API, view]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

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

  return (
    <>
      <Header />
      <div className="container">
        <h2>Admin Dashboard</h2>

        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="primary" onClick={() => setView("users")}>
            Manage Users
          </button>
          <button className="secondary" onClick={() => setView("technicians")}>
            Manage Technicians
          </button>
        </div>

        {/* ✅ WRAPPER عشان الجدول ما يطلع لبرا */}
        {view === "users" ? (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table className="card" style={{ width: "100%", minWidth: 750 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>View</th>
                  <th>Delete</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.name}</td>
                    <td>{u.email}</td>
                    <td>{u.phone}</td>
                    <td>{u.city}</td>
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
        ) : (
          <div style={{ width: "100%", overflowX: "auto" }}>
            <table className="card" style={{ width: "100%", minWidth: 950 }}>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>City</th>
                  <th>Service</th>
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
                    <td>{t.phone}</td>
                    <td>{t.city}</td>
                    <td>{t.service}</td>
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
        )}

        {/* ✅ الفورم بنفس الكلاسات القديمة */}
        <div className="panel admin-form">
          <h3 className="section-title">Add {view === "users" ? "User" : "Technician"}</h3>

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

          {view === "technicians" ? (
            <>
              <div className="input-group">
                <label>Service</label>
                <select
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                >
                  <option value="">Select a service</option>
                  {serviceOptions.map((service) => (
                    <option key={service} value={service}>
                      {service}
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

          <button
            className="primary"
            onClick={async () => {
              try {
                if (view === "users") {
                  await API.post("/admin/users", {
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    city: form.city,
                    password: form.password,
                  });
                  setView("users");
                  fetchData();
                } else {
                  await API.post("/admin/technicians", {
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    city: form.city,
                    password: form.password,
                    service: form.service,
                    experience: form.experience,
                  });
                  setView("technicians");
                  fetchData();
                }

                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  city: "",
                  password: "",
                  service: "",
                  experience: "",
                });

                alert(`${view === "users" ? "User" : "Technician"} added successfully.`);
              } catch (error) {
                alert(error.response?.data?.message || error.message);
              }
            }}
          >
            Add {view === "users" ? "User" : "Technician"}
          </button>
        </div>
      </div>

      {/* ✅ مودال مرتب مثل message box */}
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
              <span>{selectedProfile.type === "user" ? "User Profile" : "Technician Profile"}</span>
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
                    <InfoRow label="Service" value={selectedProfile.data.service} />
                    <InfoRow label="Experience" value={`${selectedProfile.data.experience} yrs`} />
                  </>
                ) : null}
              </div>

              <div style={{ marginTop: 14, display: "flex", justifyContent: "flex-end" }}>
                {selectedProfile.type === "user" ? (
                  <button className="btn-outline" onClick={() => handleDeleteUser(selectedProfile.data.id)}>
                    Delete User
                  </button>
                ) : (
                  <button className="btn-outline" onClick={() => handleDeleteTechnician(selectedProfile.data.technicianId)}>
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