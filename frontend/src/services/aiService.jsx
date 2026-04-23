import API from "./api";

export const createMockPayment = (data) =>
  API.post("/payments/create-intent", data).then((res) => res.data);