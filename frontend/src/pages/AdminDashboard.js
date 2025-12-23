import React, { useEffect, useState } from 'react';
import { getStats, getUsers, getTechnicians, getRequests, getStores } from '../services/adminService';

const AdminDashboard = () => {
    const [stats, setStats] = useState({});
    const [users,setUsers] = useState([]);
    const [technicians,setTechnicians] = useState([]);
    const [requests,setRequests] = useState([]);
    const [stores,setStores] = useState([]);

    useEffect(()=>{
        const fetchData = async ()=>{
            setStats((await getStats()).data);
            setUsers((await getUsers()).data);
            setTechnicians((await getTechnicians()).data);
            setRequests((await getRequests()).data);
            setStores((await getStores()).data);
        }
        fetchData();
    },[]);

    return (
        <div style={{ padding:'10px' }}>
            <h2>Admin Dashboard</h2>
            <div style={{ display:'flex', justifyContent:'space-around', marginBottom:'20px' }}>
                <div>Total Users: {stats.users}</div>
                <div>Total Technicians: {stats.technicians}</div>
                <div>Total Requests: {stats.requests}</div>
                <div>Total Stores: {stats.stores}</div>
            </div>

            <h3>Users</h3>
            <table border="1" width="100%">
                <thead><tr><th>ID</th><th>Name</th><th>Email</th></tr></thead>
                <tbody>{users.map(u=><tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td></tr>)}</tbody>
            </table>

            <h3>Technicians</h3>
            <table border="1" width="100%">
                <thead><tr><th>ID</th><th>Name</th><th>Service</th></tr></thead>
                <tbody>{technicians.map(t=><tr key={t.id}><td>{t.id}</td><td>{t.name}</td><td>{t.service}</td></tr>)}</tbody>
            </table>

            <h3>Requests</h3>
            <table border="1" width="100%">
                <thead><tr><th>ID</th><th>Service</th><th>Status</th></tr></thead>
                <tbody>{requests.map(r=><tr key={r.id}><td>{r.id}</td><td>{r.service}</td><td>{r.status}</td></tr>)}</tbody>
            </table>

            <h3>Stores</h3>
            <table border="1" width="100%">
                <thead><tr><th>ID</th><th>Name</th><th>City</th></tr></thead>
                <tbody>{stores.map(s=><tr key={s.id}><td>{s.id}</td><td>{s.name}</td><td>{s.city}</td></tr>)}</tbody>
            </table>
        </div>
    );
};

export default AdminDashboard;
