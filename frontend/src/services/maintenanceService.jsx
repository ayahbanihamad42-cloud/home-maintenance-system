import axios from './api';

export const createRequest = data => axios.post('/maintenance', data);
export const getUserRequests = user_id => axios.get(`/maintenance/user/${user_id}`);
import axios from './api';
export const createMaintenanceRequest = (user_id,data) => axios.post(`/maintenance`, { user_id, ...data });
