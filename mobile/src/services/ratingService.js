mobile/src/services/ratingService.js

import api from "./api";

export const submitRating = async (data) => {
  const res = await api.post("/ratings", data);
  return res.data;
};

export const getRatingByRequest = async (requestId) => {
  const res = await api.get(`/ratings/request/${requestId}`);
  return res.data;
};
