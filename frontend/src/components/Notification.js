
import React,{ useEffect,useState } from 'react';
import { getNotifications } from '../services/notificationService';

const Notification = ({ user_id }) => {
    const [notifications,setNotifications] = useState([]);

    useEffect(()=>{
        const fetch = async ()=>{
            const res = await getNotifications(user_id);
            setNotifications(res.data);
        }
        fetch();
    },[user_id]);

    return (
        <div>
            {notifications.map(n=>(
                <div key={n.id} style={{ border:'1px solid #ccc', margin:'5px', padding:'5px' }}>
                    <p>{n.message}</p>
                    <small>{new Date(n.created_at).toLocaleString()}</small>
                </div>
            ))}
        </div>
    );
}

export default Notification;
