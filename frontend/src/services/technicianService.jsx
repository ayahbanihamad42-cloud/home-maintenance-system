import api from "../services/api";

export const getTechnicians = async (service) => {
  const res = await api.get(`/technicians/service/${service}`);
  return res.data;
};

export const getAvailability = async (techId) => {
  const res = await api.get(`/technicians/${techId}/availability`);
  return res.data;
};
