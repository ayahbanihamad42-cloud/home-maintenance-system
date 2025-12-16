import React,{ useState,useEffect } from 'react';
import { updateProfile,getUserProfile } from '../services/userService';

const UserProfile = ({ user_id }) => {
    const [form,setForm] = useState({ name:'',email:'',phone:'',dob:'',city:'' });

    useEffect(()=>{
        const fetch = async ()=>{
            const res = await getUserProfile(user_id);
            setForm(res.data);
        }
        fetch();
    },[user_id]);

    const handleChange = e => setForm({...form,[e.target.name]:e.target.value});
    const handleSubmit = async e => {
        e.preventDefault();
        await updateProfile(user_id,form);
        alert('Profile updated');
    }

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" value={form.name} onChange={handleChange}/>
            <input name="email" value={form.email} onChange={handleChange}/>
            <input name="phone" value={form.phone} onChange={handleChange}/>
            <input type="date" name="dob" value={form.dob} onChange={handleChange}/>
            <input name="city" value={form.city} onChange={handleChange}/>
            <button type="submit">Update Profile</button>
        </form>
    );
}

export default UserProfile;
