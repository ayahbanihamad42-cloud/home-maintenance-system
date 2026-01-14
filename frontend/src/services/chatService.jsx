// Import the shared Axios API instance
import API from "./api";

// Fetch all chat messages related to a specific request
export const getChatMessages = request_id =>
  API.get(`/chat/request/${request_id}`).then(r => r.data);

// Send a new chat message to the backend
export const sendChatMessage = data =>
  API.post("/chat", data).then(r => r.data);
