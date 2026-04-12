mobile/src/services/technicianService.js

import api from "./api";

export const getTechnicians = async (service) => {
  const res = await api.get(`/technicians/service/${service}`);
  return res.data;
};

export const getAvailability = async (techId, date) => {
  const res = await api.get(`/technicians/${techId}/availability`, {
    params: { date }
  });
  return res.data;
};

