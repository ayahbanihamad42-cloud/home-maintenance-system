import API from "./api";

export const createMaintenanceRequest = (data) =>
  API.post("/maintenance", data).then((res) => res.data);

export const getUserRequests = () =>
  API.get("/maintenance/my").then((res) => res.data);

export const getRequestById = (id) =>
  API.get(`/maintenance/${id}`).then((res) => res.data);

export const updateRequestStatus = (id, data) =>
  API.patch(`/maintenance/${id}/status`, data).then((res) => res.data);