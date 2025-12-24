import API from "./api";

export const submitRating = async ({ requestId, rating, comment }) => {
  const res = await API.post("/ratings", {
    requestId,
    rating,
    comment,
  });
  return res.data;
};


export const getRatingByRequest = async (requestId) => {
  const res = await API.get(`/ratings/request/${requestId}`);
  return res.data;
};


export const getRatingsByTechnician = async (technicianId) => {
  const res = await API.get(`/ratings/technician/${technicianId}`);
  return res.data;
};
