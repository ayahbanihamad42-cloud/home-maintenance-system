/*
  Handles maintenance request operations for users.
 */

import API from "./api";

export const createMaintenanceRequest = async (data) => {
  const res = await API.post("/maintenance", data);
  return res.data;
};

export const getUserRequests = async () => {
  const res = await API.get("/maintenance/my");
  return res.data;
};

export const getRequestById = async (id) => {
  const res = await API.get(`/maintenance/${id}`);
  return res.data;
};
