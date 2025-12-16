import React, { useState } from 'react';
import { registerUser } from '../services/userService';

const Register = () => {
    const [form,setForm] = useState({ name:'',email:'',phone:'',dob:'',city:'',password:'' });

    const handleChange = e => setForm({...form,[e.target.name]: e.target.value});
    const handleSubmit = async e => {
        e.preventDefault();
        try{
            const res = await registerUser(form);
            alert(res.data.message);
        } catch(err){ alert(err.response.data.message); }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input name="name" placeholder="Name" onChange={handleChange} />
            <input name="email" placeholder="Email" onChange={handleChange} />
            <input name="phone" placeholder="Phone" onChange={handleChange} />
            <input type="date" name="dob" onChange={handleChange} />
            <input name="city" placeholder="City" onChange={handleChange} />
            <input type="password" name="password" placeholder="Password" onChange={handleChange} />
            <button type="submit">Register</button>
        </form>
    );
}

export default Register;
