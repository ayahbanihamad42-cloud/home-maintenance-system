import React, { useEffect, useState } from "react";
import { getToken } from "../../services/auth.service.jsx";
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
            <th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Service</th><th>Experience</th>            </tr>
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
    </div>
  );
}

export default AdminDashboard;
