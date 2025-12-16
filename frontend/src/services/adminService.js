import axios from './api';

export const getStats = () => axios.get('/admin/stats');
export const getUsers = () => axios.get('/admin/users');
export const getTechnicians = () => axios.get('/admin/technicians');
export const getRequests = () => axios.get('/admin/requests');
export const getStores = () => axios.get('/admin/stores');
