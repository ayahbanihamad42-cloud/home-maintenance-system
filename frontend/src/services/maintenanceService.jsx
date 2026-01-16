// Import the shared Axios API instance
import API from "./api";

// Create a new maintenance request
export const createMaintenanceRequest = (data) =>
  API.post("/maintenance", data).then((res) => res.data);

// Get all maintenance requests for the logged-in user
export const getUserRequests = () =>
  API.get("/maintenance/my").then((res) => res.data);

// Get details of a single maintenance request by its ID
export const getRequestById = (id) =>
  API.get(`/maintenance/${id}`).then((res) => res.data);

// Update request status (if you use it in technician/admin flows)
export const updateRequestStatus = (id, data) =>
  API.patch(`/maintenance/${id}/status`, data).then((res) => res.data);
