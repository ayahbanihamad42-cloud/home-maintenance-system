import API from "./api";

const getBackendBaseUrl = () => {
  const baseURL = API.defaults.baseURL || "";
  return baseURL.replace(/\/api\/?$/, "");
};

export const getAdminUsers = async () => {
  const res = await API.get("/admin/users");
  return res.data;
};

export const createAdminUser = async (data) => {
  const res = await API.post("/admin/users", data);
  return res.data;
};

export const deleteAdminUser = async (id) => {
  const res = await API.delete(`/admin/users/${id}`);
  return res.data;
};

export const getAdminTechnicians = async () => {
  const res = await API.get("/admin/technicians");
  return res.data;
};

export const createAdminTechnician = async (data) => {
  const res = await API.post("/admin/technicians", data);
  return res.data;
};

export const deleteAdminTechnician = async (id) => {
  const res = await API.delete(`/admin/technicians/${id}`);
  return res.data;
};

export const getAdminStores = async () => {
  const res = await API.get("/admin/stores");
  return res.data;
};

export const createAdminStore = async (data) => {
  const res = await API.post("/admin/stores", data);
  return res.data;
};

export const deleteAdminStore = async (id) => {
  const res = await API.delete(`/admin/stores/${id}`);
  return res.data;
};

export const getAdminServices = async () => {
  const res = await API.get("/admin/services");
  return res.data;
};

export const createAdminService = async (data) => {
  const res = await API.post("/admin/services", data);
  return res.data;
};

export const deleteAdminService = async (id) => {
  const res = await API.delete(`/admin/services/${id}`);
  return res.data;
};

export const getBackendImageUrl = (imageUrl) => {
  if (!imageUrl) return "";

  if (
    String(imageUrl).startsWith("http://") ||
    String(imageUrl).startsWith("https://") ||
    String(imageUrl).startsWith("data:image/")
  ) {
    return imageUrl;
  }

  return `${getBackendBaseUrl()}${imageUrl}`;
};