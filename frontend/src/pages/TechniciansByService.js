import React,{ useEffect,useState } from 'react';
import { getTechniciansByService } from '../services/technicianService';

const TechniciansByService = ({ service }) => {
    const [technicians,setTechnicians] = useState([]);

    useEffect(()=>{
        const fetch = async ()=>{
            const res = await getTechniciansByService(service);
            setTechnicians(res.data);
        }
        fetch();
    },[service]);

    return (
        <div>
            {technicians.map(t=>(
                <div key={t.id}>
                    <h3>{t.name}</h3>
                    <p>Service: {t.service}</p>
                    <p>Experience: {t.experience} years</p>
                </div>
            ))}
        </div>
    );
}

export default TechniciansByService;
