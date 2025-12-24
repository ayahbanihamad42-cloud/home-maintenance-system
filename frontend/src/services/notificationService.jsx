import API from "./api";

export const getNotifications = user_id =>
  API.get(`/notifications/user/${user_id}`);

export const sendNotification = data =>
  API.post("/notifications", data);
