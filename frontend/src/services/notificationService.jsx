// Import the shared Axios API instance
import API from "./api";

// Fetch all notifications for a specific user
export const getNotifications = user_id =>
  API.get(`/notifications/user/${user_id}`);

// Send a new notification
export const sendNotification = data =>
  API.post("/notifications", data);

