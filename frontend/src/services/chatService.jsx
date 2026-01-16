// Import the shared Axios API instance
import API from "./api";

// Fetch all chat messages between logged-in user and another user
export const getChatMessages = (userId) =>
  API.get(`/chat/${userId}`).then((r) => r.data);

// Send a new chat message to the backend
export const sendChatMessage = (data) =>
  API.post("/chat", data).then((r) => r.data);
