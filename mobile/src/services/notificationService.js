import api from "./api";

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.notifications)) return data.notifications;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.feed)) return data.feed;
  return [];
};

export const getNotifications = async () => {
  const res = await api.get("/notifications/feed");
  return normalizeArray(res.data);
};

export const getUserNotifications = async () => {
  try {
    const res = await api.get("/notifications/feed");
    return normalizeArray(res.data);
  } catch {
    const res = await api.get("/notifications");
    return normalizeArray(res.data);
  }
};

export const markNotificationAsRead = async (id) => {
  if (!id || String(id).includes("stored-") || String(id).includes("msg-") || String(id).includes("req-")) {
    return null;
  }

  const res = await api.put(`/notifications/${id}`);
  return res.data;
};