import API from "./api";

export const submitRating = async (data) => {
  const res = await API.post("/ratings", data);
  return res.data;
};

export const getRatingByRequest = async (requestId) => {
  const res = await API.get(`/ratings/request/${requestId}`);
  return res.data;
};
