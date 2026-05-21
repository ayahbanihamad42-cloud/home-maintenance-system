import API from "./api.jsx";

export const getChatConversations = () =>
  API.get("/chat/conversations").then((res) => res.data);

export const getChatMessages = (userId) =>
  API.get(`/chat/${userId}`).then((res) => res.data);

export const sendChatMessage = (data) =>
  API.post("/chat", data).then((res) => res.data);