import api from "./api";

const normalizeArray = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.requests)) return data.requests;
  return [];
};

export const createMaintenanceRequest = async (payload) => {
  const res = await api.post("/maintenance", payload);
  return res.data;
};

export const getUserRequests = async () => {
  const res = await api.get("/maintenance/my");
  return normalizeArray(res.data);
};

export const getRequestById = async (id) => {
  const res = await api.get(`/maintenance/${id}`);
  return res.data;
};

export const updateRequestStatus = async (id, data) => {
  const res = await api.patch(`/maintenance/${id}/status`, data);
  return res.data;
};