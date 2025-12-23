import axios from './api';

export const chatWithAI = data => axios.post('/ai/chat', data);
