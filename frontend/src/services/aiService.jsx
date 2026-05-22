import API from "./api";

export const chatWithAI = async (message, image = null) => {
  const res = await API.post("/ai/chat", {
    message,
    image,
  });

  return res.data;
};

export const getAIResponses = async (userId) => {
  const res = await API.get(`/ai/${userId}`);
  return res.data;
};