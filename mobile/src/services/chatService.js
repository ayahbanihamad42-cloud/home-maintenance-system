import API from "./api";

export const getChatConversations = async () => {
  const res = await API.get("/chat/conversations");
  return res.data;
};

export const getChatMessages = async (userId) => {
  const res = await API.get(`/chat/${userId}`);
  return res.data;
};

export const sendChatMessage = async (data) => {
  const res = await API.post("/chat", data);
  return res.data;
};