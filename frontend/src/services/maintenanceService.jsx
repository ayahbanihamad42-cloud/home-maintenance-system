import API from "./api";

export const createMaintenanceRequest = (data) =>
  API.post("/maintenance", data).then((res) => res.data);

export const getUserRequests = (userId) =>
  API.get(`/maintenance/user/${userId}`).then((res) => res.data);

export const getRequestById = (id) =>
  API.get(`/maintenance/${id}`).then((res) => res.data);

export const updateRequestStatus = (id, data) =>
  API.put(`/maintenance/${id}/status`, data).then((res) => res.data);

export const cancelMaintenanceRequest = (id) =>
  API.put(`/maintenance/${id}/status`, {
    status: "cancelled",
  }).then((res) => res.data);