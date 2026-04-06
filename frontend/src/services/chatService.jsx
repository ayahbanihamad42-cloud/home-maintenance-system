mobile/src/services/chatService.js

import api from "./api";

export const getChatMessages = async (userId) => {
  const res = await api.get(`/chat/${userId}`);
  return res.data;
};

export const sendChatMessage = async (data) => {
  const res = await api.post("/chat", data);
  return res.data;
};
