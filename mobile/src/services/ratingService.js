import api from "./api";

export const submitRating = async (data) => {
  const res = await api.post("/ratings", data);
  return res.data;
};

export const addRating = async (data) => {
  const res = await api.post("/ratings", data);
  return res.data;
};

export const getRatingByRequest = async (requestId) => {
  const res = await api.get(`/ratings/request/${requestId}`);
  return res.data;
};

export const getTechnicianRatings = async (technicianId) => {
  const res = await api.get(`/ratings/technician/${technicianId}`);
  return res.data;
};