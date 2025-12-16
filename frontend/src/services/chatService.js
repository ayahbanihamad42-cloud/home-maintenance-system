import axios from './api';

export const getChatByRequest = request_id => axios.get(`/chat/${request_id}`);
export const sendMessage = data => axios.post('/chat', data);
