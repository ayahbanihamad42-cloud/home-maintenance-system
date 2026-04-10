// Import the shared Axios API instance
import API from "./api";

// Fetch notification feed (messages + requests) for logged-in user
export const getNotifications = () => API.get("/notifications/feed");

// Fetch raw notifications table for the logged-in user (optional)
export const getUserNotifications = () => API.get("/notifications");

// Mark a notification as read
export const markNotificationAsRead = (id) => API.put(`/notifications/${id}`);

// Send a new notification (if your backend supports POST /notifications)
export const sendNotification = (data) => API.post("/notifications", data);
