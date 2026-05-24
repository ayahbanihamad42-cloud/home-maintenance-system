import API from "./api.jsx";

export const getServices = async () => {
  const res = await API.get("/services");
  return res.data;
};

export const createService = async (serviceData) => {
  const res = await API.post("/admin/services", serviceData);
  return res.data;
};

export const deleteService = async (serviceId) => {
  const res = await API.delete(`/admin/services/${serviceId}`);
  return res.data;
};