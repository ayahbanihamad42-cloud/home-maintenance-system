import React,{ useEffect,useState } from 'react';
import { getUserRequests } from '../services/maintenanceService';

const MaintenanceHistory = ({ user_id }) => {
    const [requests,setRequests] = useState([]);

    useEffect(()=>{
        const fetch = async ()=>{
            const res = await getUserRequests(user_id);
            setRequests(res.data);
        }
        fetch();
    },[user_id]);

    return (
        <div>
            <h3>Maintenance History</h3>
            {requests.map(r=>(
                <div key={r.id} style={{ border:'1px solid #ccc', padding:'5px', margin:'5px' }}>
                    <p>Service: {r.service}</p>
                    <p>Status: {r.status}</p>
                    <p>Description: {r.description}</p>
                </div>
            ))}
        </div>
    );
}

export default MaintenanceHistory;
