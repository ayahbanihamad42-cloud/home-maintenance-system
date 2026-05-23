import API from "./api";

export const createPaymentIntent = (data) =>
  API.post("/payments/create-intent", data).then((res) => res.data);

export const confirmOnlinePayment = (requestId, data) =>
  API.post(`/maintenance/${requestId}/online-payment`, data).then(
    (res) => res.data
  );

export const getMyPaymentInfo = () =>
  API.get("/payments/my-info").then((res) => res.data);

export const saveMyPaymentInfo = (data) =>
  API.post("/payments/my-info", data).then((res) => res.data);

export const getMyBalance = () =>
  API.get("/payments/my-balance").then((res) => res.data);