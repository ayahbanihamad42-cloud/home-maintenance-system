import api from "./api";

export const getChatMessages = async (userId) => {
  const res = await api.get(`/chat/${userId}`);
  return res.data;
};

export const sendChatMessage = async (data) => {
  const res = await api.post("/chat", data);
  return res.data;
};

export const getChatConversations = async () => {
  const res = await api.get("/chat/conversations");
  return res.data;
};