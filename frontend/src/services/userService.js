import axios from './api';

export const registerUser = data => axios.post('/users/register', data);
export const loginUser = data => axios.post('/users/login', data);
export const getUserProfile = (id, token) => axios.get(`/users/${id}`, { headers:{ Authorization:`Bearer ${token}` } });
export const updateUserLocation = (id,data) => axios.post(`/users/${id}/location`, data);
export const updateProfile = (id,data) => axios.put(`/users/${id}`, data);
