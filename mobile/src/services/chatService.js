import api from "./api";

export const sendMessage = async (payload) => {
  const res = await api.post("/chat", payload);
  return res.data;
};

export const getMessages = async (userId) => {
  const res = await api.get(`/chat/${userId}`);
  return res.data;
};

export const getChatConversations = async () => {
  const res = await api.get("/chat/conversations");
  return res.data;
};