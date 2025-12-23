import React from 'react';

const TechnicianCard = ({ technician }) => {
    return (
        <div style={{ border:'1px solid #ccc', borderRadius:'5px', padding:'10px', margin:'5px' }}>
            <h4>{technician.name}</h4>
            <p>Service: {technician.service}</p>
            <p>Experience: {technician.experience} years</p>
            <p>Rating: {technician.rating}</p>
            <p>Active: {technician.active ? 'Yes' : 'No'}</p>
        </div>
    );
};

export default TechnicianCard;
