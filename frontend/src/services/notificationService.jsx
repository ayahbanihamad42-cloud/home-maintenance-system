import API from "./api";

export const getNotifications = () =>
  API.get("/notifications").then((res) => res.data);

export const getNotificationFeed = () => {
   return API.get("/notifications/feed").then((res) => res.data); // ضيفنا return هون
};
export const markNotificationAsRead = (id) =>
  API.put(`/notifications/${id}`).then((res) => res.data);