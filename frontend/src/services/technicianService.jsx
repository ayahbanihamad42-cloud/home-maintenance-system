import API from "./api";

export const getTechniciansByService = service =>
  API.get(`/technicians/service/${service}`).then(r => r.data);

export const getTechnicianById = id =>
  API.get(`/technicians/${id}`).then(r => r.data);

export const assignTechnician = request_id =>
  API.post("/technicians/assign", { request_id });

export const getTechnicians = () =>
  API.get("/technicians").then(r => r.data);
