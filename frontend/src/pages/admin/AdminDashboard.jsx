import React, { useEffect, useState } from "react";
import { getToken } from "../../services/auth.service.jsx";
import Header from "../../components/common/Header";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [view, setView] = useState("users");
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
    password: "",
    service: "",
    experience: ""
  });
  const navigate = useNavigate();

  const API = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (view === "users") {
          const res = await API.get("/admin/users");
          setUsers(res.data);
        } else {
          const res = await API.get("/admin/technicians");
          const data = res.data;
          setTechnicians(data);
        }
      } catch (error) {
        alert(error.response?.data?.message || error.message);
      }
    };
    fetchData();
  }, [view]);

  return (
    <>
      <Header />
      <div className="container">
        <h2>Admin Dashboard</h2>

        <div style={{ marginBottom: "20px" }}>
          <button className="primary" onClick={() => setView("users")}>Manage Users</button>
          <button className="secondary" onClick={() => setView("technicians")}>Manage Technicians</button>
        </div>

        {view === "users" ? (
          <table className="card" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.city}</td>
                  <td>
                    <button className="btn-outline" onClick={() => navigate(`/profile/${u.id}`)}>
                      View Profile
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <table className="card" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Service</th><th>Experience</th>
              </tr>
            </thead>
            <tbody>
              {technicians.map(t => (
                <tr key={t.technicianId}>
                  <td>{t.name}</td>
                  <td>{t.email}</td>
                  <td>{t.phone}</td>
                  <td>{t.city}</td>
                  <td>{t.service}</td>
                  <td>{t.experience} yrs</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

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
                <input
                  value={form.service}
                  onChange={(e) => setForm({ ...form, service: e.target.value })}
                  placeholder="Electrical, Plumbing..."
                />
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
                    password: form.password
                  });
                  setView("users");
                } else {
                  await API.post("/admin/technicians", {
                    name: form.name,
                    email: form.email,
                    phone: form.phone,
                    city: form.city,
                    password: form.password,
                    service: form.service,
                    experience: form.experience
                  });
                  setView("technicians");
                }
                setForm({
                  name: "",
                  email: "",
                  phone: "",
                  city: "",
                  password: "",
                  service: "",
                  experience: ""
                });
              } catch (error) {
                alert(error.response?.data?.message || error.message);
              }
            }}
          >
            Add {view === "users" ? "User" : "Technician"}
          </button>
        </div>
      </div>
    </>
  );
}

export default AdminDashboard;
