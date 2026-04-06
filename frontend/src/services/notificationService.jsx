mobile/src/services/notificationService.js

import api from "./api";

export const getNotifications = async () => {
  const res = await api.get("/notifications/feed");
  return res.data;
};

export const getUserNotifications = async () => {
  const res = await api.get("/notifications");
  return res.data;
};

export const markNotificationAsRead = async (id) => {
  const res = await api.put(`/notifications/${id}`);
  return res.data;
};

export const sendNotification = async (data) => {
  const res = await api.post("/notifications", data);
  return res.data;
};

