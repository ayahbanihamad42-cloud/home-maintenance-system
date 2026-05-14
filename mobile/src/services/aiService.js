import api from "./api";

export const chatWithAI = async (message, image = null) => {
  const res = await api.post("/ai/chat", {
    message,
    image,
  });

  return res.data;
};

export const getAIResponses = async (userId) => {
  const res = await api.get(`/ai/${userId}`);
  return res.data;
};