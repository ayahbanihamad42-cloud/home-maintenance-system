import API from "./api";

export const createMaintenanceRequest = (data) =>
  API.post("/maintenance", data).then((res) => res.data);

export const getUserRequests = (userId) =>
  API.get(`/maintenance/user/${userId}`).then((res) => res.data);

export const getMyRequests = () =>
  API.get("/maintenance/my").then((res) => res.data);

export const getRequestById = (id) =>
  API.get(`/maintenance/${id}`).then((res) => res.data);

export const updateRequestStatus = (id, data) =>
  API.put(`/maintenance/${id}/status`, data).then((res) => res.data);

export const cancelMaintenanceRequest = (id) =>
  API.delete(`/maintenance/${id}`).then((res) => res.data);

export const confirmOnlinePayment = (id, data) =>
  API.post(`/maintenance/${id}/online-payment`, data).then((res) => res.data);