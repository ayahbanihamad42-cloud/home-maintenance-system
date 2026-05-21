import API from "./api";

export const createPaymentIntent = (data) =>
  API.post("/payments/create-intent", data).then((res) => res.data);