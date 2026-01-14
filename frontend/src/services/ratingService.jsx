// Import the shared Axios API instance
import API from "./api";

// Submit a new rating for a technician after completing a request
export const submitRating = async (data) => {
  const res = await API.post("/ratings", data); // Send rating data to backend
  return res.data; // Return response data
};

// Get the rating associated with a specific maintenance request
export const getRatingByRequest = async (requestId) => {
  const res = await API.get(`/ratings/request/${requestId}`); // Fetch rating by request ID
  return res.data; // Return rating data
};
