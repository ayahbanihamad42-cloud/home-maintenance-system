import API from "./api";

export const chatWithAI = message =>
  API.post("/ai/chat", { message }).then(r => r.data);

export const getAIResponses = user_id =>
  API.get(`/ai/${user_id}`).then(r => r.data);
