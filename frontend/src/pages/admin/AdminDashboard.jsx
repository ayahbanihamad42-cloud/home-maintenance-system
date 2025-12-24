import React, { useEffect, useState } from "react";
import { fetchCurrentUser } from "../../services/auth.service.jsx";
import { assignTechnician, getTechnicians } from "../../services/technicianService";

function AdminDashboard() {
  const [view, setView] = useState("users");
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (view === "users") {
          const { data } = await fetchCurrentUser();
          setUsers(data);
        } else {
          const { data } = await getTechnicians();
          setTechnicians(data);
        }
      } catch (error) {
        alert(error.message);
      }
    };
    fetchData();
  }, [view]);

  const handleAddTechnician = async (tech) => {
    try {
      await assignTechnician(tech);
      alert(`Technician ${tech.name} added successfully`);
      const { data } = await getTechnicians();
      setTechnicians(data);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <div style={{ marginBottom: "20px" }}>
        <button className="primary" onClick={() => setView("users")}>
          Manage Users
        </button>
        <button className="secondary" onClick={() => setView("technicians")}>
          Manage Technicians
        </button>
      </div>

      {view === "users" ? (
        <table className="card" style={{ width: "100%" }}>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Actions</th>
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
                    className="primary"
                    onClick={() => alert(`View ${u.name} Profile`)}
                  >
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
              <th>Name</th><th>Email</th><th>Phone</th><th>City</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {technicians.map((t) => (
              <tr key={t.id}>
                <td>{t.name}</td>
                <td>{t.email}</td>
                <td>{t.phone}</td>
                <td>{t.city}</td>
                <td>
                  <button
                    className="primary"
                    onClick={() => handleAddTechnician(t)}
                  >
                    Add
                  </button>
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
