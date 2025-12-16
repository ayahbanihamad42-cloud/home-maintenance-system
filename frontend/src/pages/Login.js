import React,{ useState } from 'react';
import { loginUser } from '../services/userService';

const Login = () => {
    const [form,setForm] = useState({ email:'',password:'' });
    const handleChange = e => setForm({...form,[e.target.name]:e.target.value});

    const handleSubmit = async e => {
        e.preventDefault();
        try{
            const res = await loginUser(form);
            localStorage.setItem('token',res.data.token);
            localStorage.setItem('user',JSON.stringify(res.data.user));
            alert(res.data.message);
        }catch(err){ alert(err.response.data.message); }
    }

    return (
        <form onSubmit={handleSubmit}>
            <input name="email" placeholder="Email" onChange={handleChange}/>
            <input type="password" name="password" placeholder="Password" onChange={handleChange}/>
            <button type="submit">Login</button>
        </form>
    );
}

export default Login;
