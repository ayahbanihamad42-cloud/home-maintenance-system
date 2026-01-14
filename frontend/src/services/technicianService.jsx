// Import the shared Axios API instance
import API from "./api";

// Get technicians filtered by service type
export const getTechniciansByService = service =>
  API.get(`/technicians/service/${service}`).then(r => r.data);

// Get a single technician by ID
export const getTechnicianById = id =>
  API.get(`/technicians/${id}`).then(r => r.data);

// Assign a technician to a maintenance request
export const assignTechnician = request_id =>
  API.post("/technicians/assign", { request_id });

// Get all technicians
export const getTechnicians = () =>
  API.get("/technicians").then(r => r.data);






