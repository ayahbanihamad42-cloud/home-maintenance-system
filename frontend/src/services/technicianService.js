import API from "./api";

export const getTechniciansByService = async (service) => {
  const res = await API.get(`/technicians/service/${service}`);
  return res.data;
};

export const assignTechnician = async (request_id) => {
  const res = await API.post("/technicians/assign", { request_id });
  return res.data;
};

export const getTechnicianById = async (id) => {
  const res = await API.get(`/technicians/${id}`);
  return res.data;
};

export const getTechnicians = async () => {
  const res = await API.get("/technicians");
  return res.data;
};

export const getTechnicianServices = async (service) => {
  const res = await API.get(`/technicians/services/${service}`);
  return res.data;
};
