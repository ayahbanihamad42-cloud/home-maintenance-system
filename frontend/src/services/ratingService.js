import API from "./api";

export const submitRating = async (request_id, data) => {
  const res = await API.post(`/rating/${request_id}`, data);
  return res.data;
};
