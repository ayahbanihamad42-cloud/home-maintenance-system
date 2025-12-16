import axios from './api';

export const getTechniciansByService = service => axios.get(`/technicians/service/${service}`);
export const assignTechnician = request_id => axios.post('/technicians/assign',{ request_id });
export const getTechnicianById = id => axios.get(`/technicians/${id}`);




