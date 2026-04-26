import API from "./api";

export const getChatMessages = (userId) =>
  API.get(`/chat/${userId}`).then((r) => r.data);

export const sendChatMessage = (data) =>
  API.post("/chat", data).then((r) => r.data);

export const getChatConversations = () =>
  API.get("/chat/conversations").then((r) => r.data);