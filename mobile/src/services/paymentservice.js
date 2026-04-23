import api from "./api";

export const createMockPayment = async (data) => {
  const res = await api.post("/payments/create-intent", data);
  return res.data;
};