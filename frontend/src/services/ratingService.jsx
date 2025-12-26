/*
 Submits and fetches ratings for technicians.
 */

import API from "./api";

export const submitRating = async (data) => {
  const res = await API.post("/ratings", data);
  return res.data;
};

export const getRatingsByTechnician = async (technicianId) => {
  const res = await API.get(`/ratings/technician/${technicianId}`);
  return res.data;
};
