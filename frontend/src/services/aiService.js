import API from "./api";

export const chatWithAI = async (data) => {
  const res = await API.post('/ai/chat', data);
  return res.data;
};

export const getAIResponses = async (user_id) => {
  const res = await API.get(`/ai/${user_id}`);
  return res.data;
};

export const sendAIMessage = async (data) => {
  const res = await API.post(`/ai`, data);
  return res.data;
};
