import React, { useEffect, useState } from "react";
import { getUser, getToken } from "../../services/auth.service.jsx"; // ملف auth.service.js
import { getAvailability,getTechnicians } from "../../services/technicianService.jsx";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function AdminDashboard() {
  const [view, setView] = useState("users"); // "users" أو "technicians"
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);
  const navigate = useNavigate();

  const API = axios.create({
    baseURL: "http://localhost:5000/api",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  // جلب البيانات من الباك
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (view === "users") {
          const res = await API.get("/users"); // Endpoint الباك لجلب المستخدمين
          setUsers(res.data);
        } else {
          const data = await getTechnicians();
          setTechnicians(data);
        }
      } catch (error) {
        alert(error.response?.data?.message || error.message);
      }
    };
    fetchData();
  }, [view]);

  // إضافة فني لطلب
  const handleAddTechnician = async (technician) => {
    try {
      await getTechnicians(technician.id); // افترضنا assignTechnician يستقبل ID
      alert(`Technician ${technician.name} added successfully`);
      const data = await getTechnicians();
      setTechnicians(data);
    } catch (error) {
      alert(error.response?.data?.message || error.message);
    }
  };

  return (
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
                  <button onClick={() => navigate(`/profile/${u.id}`)}>View Profile</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="card" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map(t => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.email}</td>
                <td>{t.phone}</td>
                <td>{t.city}</td>
                <td>
                  <button onClick={() => handleAddTechnician(t)}>Add</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminDashboard;
