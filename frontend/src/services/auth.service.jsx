mobile/src/services/aiService.js

import api from "./api";

export const chatWithAI = async (message) => {
  const res = await api.post("/ai/chat", { message });
  return res.data;
};

export const getAIResponses = async (userId) => {
  const res = await api.get(`/ai/${userId}`);
  return res.data;
};
