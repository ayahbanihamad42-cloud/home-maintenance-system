import API from "./api";

export const createPaymentIntent = async (data) => {
  const res = await API.post("/payments/create-intent", data);
  return res.data;
};