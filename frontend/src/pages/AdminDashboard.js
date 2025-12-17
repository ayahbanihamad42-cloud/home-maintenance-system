import React, { useEffect, useState } from "react";
import { getUsers } from "../services/userService";
import { getTechnicians } from "../services/technicianService";
import TechnicianCard from "../components/TechnicianCard";

function AdminDashboard() {
  const [view, setView] = useState("users"); // or "technicians"
  const [users, setUsers] = useState([]);
  const [technicians, setTechnicians] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        if(view === "users") {
          const data = await getUsers();
          setUsers(data);
        } else {
          const data = await getTechnicians();
          setTechnicians(data);
        }
      } catch (error) {
        alert(error.message);
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
                <td><button className="primary" onClick={()=>alert(`View ${u.name} Profile`)}>View Profile</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        technicians.map(t => <TechnicianCard key={t.id} technician={t} />)
      )}
    </div>
  );
}

export default AdminDashboard;
