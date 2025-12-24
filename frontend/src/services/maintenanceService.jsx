import API from "./api";

export const createMaintenanceRequest = data =>
  API.post("/maintenance", data);

export const getUserRequests = user_id =>
  API.get(`/maintenance/user/${user_id}`);

export const getRequestById = id =>
  API.get(`/maintenance/${id}`);
