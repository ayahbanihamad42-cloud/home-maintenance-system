// Import the configured Axios API instance
import API from "./api";

// Send a message to the AI chat endpoint
// message: text sent by the user to the AI assistant
export const chatWithAI = message =>
  API.post("/ai/chat", { message })
    .then(r => r.data);

// Get previous AI responses for a specific user
// user_id: ID of the user whose AI chat history is requested
export const getAIResponses = user_id =>
  API.get(`/ai/${user_id}`)
    .then(r => r.data);


