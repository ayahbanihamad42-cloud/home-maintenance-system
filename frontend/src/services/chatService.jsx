/*
 Handles communication between user and technician
 for a specific maintenance request.
 */

import API from "./api";

export const getChatMessages = async (request_id) => {
  const res = await API.get(`/chat/${request_id}`);
  return res.data;
};

export const sendChatMessage = async (data) => {
  const res = await API.post("/chat", data);
  return res.data;
};
