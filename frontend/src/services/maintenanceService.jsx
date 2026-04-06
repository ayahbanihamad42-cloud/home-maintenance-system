mobile/src/services/maintenanceService.js

import api from "./api";

export const createMaintenanceRequest = async (data) => {
  const res = await api.post("/maintenance", data);
  return res.data;
};

export const getUserRequests = async () => {
  const res = await api.get("/maintenance/my");
  return res.data;
};

export const getRequestById = async (id) => {
  const res = await api.get(`/maintenance/${id}`);
  return res.data;
};

export const updateRequestStatus = async (id, data) => {
  const res = await api.patch(`/maintenance/${id}/status`, data);
  return res.data;
};

