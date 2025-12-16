import React, { useEffect, useState } from 'react';
import { getTechnicianById } from '../services/technicianService';
import { useParams } from 'react-router-dom';

const TechnicianProfile = () => {
    const { id } = useParams();
    const [technician, setTechnician] = useState(null);

    useEffect(()=>{
        const fetch = async ()=>{
            const res = await getTechnicianById(id);
            setTechnician(res.data);
        }
        fetch();
    },[id]);

    if(!technician) return <p>Loading...</p>;

    return (
        <div style={{ maxWidth:'500px', margin:'auto', padding:'10px', border:'1px solid #ccc', borderRadius:'5px' }}>
            <h3>{technician.name}</h3>
            <p>Service: {technician.service}</p>
            <p>Experience: {technician.experience} years</p>
            <p>Rating: {technician.rating}</p>
            <p>Active: {technician.active ? 'Yes' : 'No'}</p>
        </div>
    );
};

export default TechnicianProfile;
