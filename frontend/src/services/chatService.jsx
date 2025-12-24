import API from "./api";

export const getChatMessages = request_id =>
  API.get(`/chat/request/${request_id}`).then(r => r.data);

export const sendChatMessage = data =>
  API.post("/chat", data).then(r => r.data);
