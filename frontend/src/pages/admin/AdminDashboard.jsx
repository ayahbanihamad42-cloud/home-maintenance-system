import React, { useCallback, useEffect, useMemo, useState } from "react";
// React library and hooks

import { getToken } from "../../services/auth.service.jsx";
// Auth service to get access token

import Header from "../../components/common/Header";
// Header component

import axios from "axios";
// HTTP client

// Reusable row component for profile info
function InfoRow({ label, value }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ color: "#546e7a", fontWeight: 600 }}>{label}:</span>
      <strong style={{ color: "#263238" }}>{value}</strong>
    </div>
  );
}

// Admin dashboard component
function AdminDashboard() {

  // Current view (users or technicians)
  const [view, setView] = useState("users");

  // Users list
  const [users, setUsers] = useState([]);

  // Technicians list
  const [technicians, setTechnicians] = useState([]);

  // Selected profile for modal view
  const [selectedProfile, setSelectedProfile] = useState(null);

  // Form state for adding user/technician
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    service: "",
    experience: "",
  });

  // Available service options
  const serviceOptions = ["Plumbing", "Electrical", "Painting", "Decoration"];

  // Axios instance with base URL and auth token
  const API = useMemo(
    () =>
      axios.create({
        baseURL: "http://localhost:5000/api",
        headers: { Authorization: `Bearer ${getToken()}` },
      }),
    []
  );

  // Fetch users or technicians based on current view
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

  // Load data when view changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Delete user by ID
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

  // Delete technician by ID
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
      {/* Page header */}
      <Header />

      <div className="container">
        <h2>Admin Dashboard</h2>

        {/* View toggle buttons */}
        <div style={{ marginBottom: "20px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button className="primary" onClick={() => setView("users")}>
            Manage Users
          </button>
          <button className="secondary" onClick={() => setView("technicians")}>
            Manage Technicians
          </button>
        </div>

        {/* Users table */}
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
                      <button
                        className="btn-outline"
                        onClick={() => handleDeleteUser(u.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Technicians table */
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
                        onClick={() =>
                          setSelectedProfile({ type: "technician", data: t })
                        }
                      >
                        View
                      </button>
                    </td>
                    <td>
                      <button
                        className="btn-outline"
                        onClick={() =>
                          handleDeleteTechnician(t.technicianId)
                        }
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

        {/* Add user/technician form */}
        <div className="panel admin-form">
          <h3 className="section-title">
            Add {view === "users" ? "User" : "Technician"}
          </h3>

          {/* Form inputs */}
          <div className="input-group">
            <label>Name</label>
            <input
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>Email</label>
            <input
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>Phone</label>
            <input
              value={form.phone}
              onChange={(e) =>
                setForm({ ...form, phone: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>City</label>
            <input
              value={form.city}
              onChange={(e) =>
                setForm({ ...form, city: e.target.value })
              }
            />
          </div>

          <div className="input-group">
            <label>Temporary Password</label>
            <input
              type="password"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
          </div>

          {/* Technician-specific fields */}
          {view === "technicians" && (
            <>
              <div className="input-group">
                <label>Service</label>
                <select
                  value={form.service}
                  onChange={(e) =>
                    setForm({ ...form, service: e.target.value })
                  }
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
                  onChange={(e) =>
                    setForm({ ...form, experience: e.target.value })
                  }
                />
              </div>
            </>
          )}

          {/* Submit button */}
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
                } else {
                  await API.post("/admin/technicians", {
                    ...form,
                  });
                }

                fetchData();

                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  city: "",
                  password: "",
                  service: "",
                  experience: "",
                });

                alert(
                  `${view === "users" ? "User" : "Technician"} added successfully.`
                );
              } catch (error) {
                alert(error.response?.data?.message || error.message);
              }
            }}
          >
            Add {view === "users" ? "User" : "Technician"}
          </button>
        </div>
      </div>

      {/* Profile modal */}
      {selectedProfile && (
        <div
          onClick={() => setSelectedProfile(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.35)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ background: "#fff", borderRadius: 16 }}
          >
            {/* Modal content */}
          </div>
        </div>
      )}
    </>
  );
}

// Export component
export default AdminDashboard;