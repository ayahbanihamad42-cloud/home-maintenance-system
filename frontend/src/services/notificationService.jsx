/*
 Fetches and updates user notifications.
 */

import API from "./api";

export const getNotifications = async () => {
  const res = await API.get("/notifications");
  return res.data;
};

export const markAsRead = async (id) => {
  await API.put(`/notifications/${id}`);
};

export const getNotificationFeed = async () => {
  const res = await API.get("/notifications/feed");
  return res.data;
};
