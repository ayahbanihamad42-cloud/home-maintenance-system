import API from "./api";

export const submitRating = (data) =>
  API.post("/ratings", data).then((res) => res.data);

export const addRating = (data) =>
  API.post("/ratings", data).then((res) => res.data);

export const getRatingByRequest = (requestId) =>
  API.get(`/ratings/request/${requestId}`).then((res) => res.data);

export const getTechnicianRatings = (technicianId) =>
  API.get(`/ratings/technician/${technicianId}`).then((res) => res.data);