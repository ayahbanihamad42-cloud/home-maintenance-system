import React, { useState, useEffect } from 'react';
import { createMaintenanceRequest } from '../services/maintenanceService';
import { getTechnicians } from '../services/technicianService';
import { useNavigate } from 'react-router-dom';

const MaintenanceRequest = ({ user_id }) => {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        service:'',
        description:'',
        date:'',
        time:'',
        city:'',
        latitude:'',
        longitude:'',
        technician_id:'',
        payment_method:'Cash'  // default
    });
    const [technicians, setTechnicians] = useState([]);

    // جلب قائمة الفنيين
    useEffect(()=>{
        const fetch = async ()=>{
            const res = await getTechnicians(); // API GET /technicians
            setTechnicians(res.data);
        }
        fetch();
    },[]);

    // جلب الموقع الحالي
    useEffect(()=>{
        if(navigator.geolocation){
            navigator.geolocation.getCurrentPosition(pos=>{
                setForm(prev => ({
                    ...prev,
                    latitude: pos.coords.latitude,
                    longitude: pos.coords.longitude
                }));
            });
        }
    },[]);

    const handleChange = e => setForm({...form,[e.target.name]:e.target.value});

    const handleSubmit = async e => {
        e.preventDefault();
        try {
            const res = await createMaintenanceRequest(user_id, form);
            alert('Maintenance request submitted!');
            navigate(`/review/${res.data.id}`); // الانتقال لصفحة التقييم بعد الإرسال
        } catch(err){
            alert('Error submitting request');
        }
    }

    return (
        <form onSubmit={handleSubmit} style={{ maxWidth:'600px', margin:'auto', padding:'10px', border:'1px solid #ccc', borderRadius:'5px' }}>
            <h3>Create Maintenance Request</h3>

            <label>Service:</label>
            <input name="service" value={form.service} onChange={handleChange} placeholder="Service type" required />

            <label>Description:</label>
            <textarea name="description" value={form.description} onChange={handleChange} placeholder="Describe the problem" required />

            <label>Date:</label>
            <input type="date" name="date" value={form.date} onChange={handleChange} required />

            <label>Time:</label>
            <input type="time" name="time" value={form.time} onChange={handleChange} required />

            <label>City:</label>
            <input name="city" value={form.city} onChange={handleChange} placeholder="City" required />

            <label>Technician:</label>
            <select name="technician_id" value={form.technician_id} onChange={handleChange} required>
                <option value="">Select Technician</option>
                {technicians.map(t=>(
                    <option key={t.id} value={t.id}>{t.name} - {t.service}</option>
                ))}
            </select>

            <label>Payment Method:</label>
            <select name="payment_method" value={form.payment_method} onChange={handleChange}>
                <option value="Cash">Cash</option>
                <option value="ePayment">ePayment</option>
            </select>

            <p>Location (detected automatically, can adjust):</p>
            <p>Latitude: {form.latitude}, Longitude: {form.longitude}</p>

            {/* يمكن لاحقاً إضافة خريطة تفاعلية هنا لتحديد الموقع */}
            
            <button type="submit" style={{ marginTop:'10px' }}>Submit Request</button>
        </form>
    );
};

export default MaintenanceRequest;
