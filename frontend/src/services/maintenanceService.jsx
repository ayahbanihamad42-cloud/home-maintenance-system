// Import the shared Axios API instance
import API from "./api";

// Create a new maintenance request
export const createMaintenanceRequest = data =>
  API.post("/maintenance", data);

// Get all maintenance requests for a specific user
export const getUserRequests = user_id =>
  API.get(`/maintenance/user/${user_id}`);

// Get details of a single maintenance request by its ID
export const getRequestById = id =>
  API.get(`/maintenance/${id}`);
