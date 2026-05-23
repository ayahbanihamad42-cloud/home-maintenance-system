import API from "./api";

export const createPaymentIntent = async (data) => {
  const res = await API.post("/payments/create-intent", data);
  return res.data;
};

export const confirmOnlinePayment = async (requestId, data) => {
  const res = await API.post(`/maintenance/${requestId}/online-payment`, data);
  return res.data;
};

export const getMyPaymentInfo = async () => {
  const res = await API.get("/payments/my-info");
  return res.data;
};

export const saveMyPaymentInfo = async (data) => {
  const res = await API.post("/payments/my-info", data);
  return res.data;
};

export const getMyBalance = async () => {
  const res = await API.get("/payments/my-balance");
  return res.data;
};