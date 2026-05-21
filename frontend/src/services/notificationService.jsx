import API from "./api";

export const getNotifications = () =>
  API.get("/notifications").then((res) => res.data);

export const getNotificationFeed = () =>
  API.get("/notifications/feed").then((res) => res.data);

export const markNotificationAsRead = (id) =>
  API.put(`/notifications/${id}`).then((res) => res.data);