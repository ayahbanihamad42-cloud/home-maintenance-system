import api from "./api";

export const createMaintenanceRequest = async (payload) => {
  try {
    const res = await api.post("/maintenance", payload);
    return res.data;
  } catch (err) {
    console.error(
      "createMaintenanceRequest error:",
      err?.response?.data || err.message
    );
    throw err;
  }
};

export const getUserRequests = async () => {
  const res = await api.get("/maintenance/my-requests");
  return res.data;
};

export const getRequestById = async (id) => {
  const res = await api.get(`/maintenance/${id}`);
  return res.data;
};