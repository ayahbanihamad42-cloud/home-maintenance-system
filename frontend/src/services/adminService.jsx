import API from "./api.jsx";

export const getAdminUsers = () =>
  API.get("/admin/users").then((res) => res.data);

export const createAdminUser = (data) =>
  API.post("/admin/users", data).then((res) => res.data);

export const deleteAdminUser = (id) =>
  API.delete(`/admin/users/${id}`).then((res) => res.data);

export const getAdminTechnicians = () =>
  API.get("/admin/technicians").then((res) => res.data);

export const createAdminTechnician = (data) =>
  API.post("/admin/technicians", data).then((res) => res.data);

export const deleteAdminTechnician = (id) =>
  API.delete(`/admin/technicians/${id}`).then((res) => res.data);

export const getAdminStores = () =>
  API.get("/admin/stores").then((res) => res.data);

export const createAdminStore = (data) =>
  API.post("/admin/stores", data).then((res) => res.data);

export const deleteAdminStore = (id) =>
  API.delete(`/admin/stores/${id}`).then((res) => res.data);

export const getAdminServices = () =>
  API.get("/admin/services").then((res) => res.data);

export const createAdminService = (data) =>
  API.post("/admin/services", data).then((res) => res.data);

export const deleteAdminService = (id) =>
  API.delete(`/admin/services/${id}`).then((res) => res.data);

export const getBackendImageUrl = (imageUrl) => {
  if (!imageUrl) return "";

  if (
    String(imageUrl).startsWith("http://") ||
    String(imageUrl).startsWith("https://") ||
    String(imageUrl).startsWith("data:image/")
  ) {
    return imageUrl;
  }

  const fixedPath = String(imageUrl).startsWith("/")
    ? imageUrl
    : `/${imageUrl}`;

  return `http://localhost:5000${fixedPath}`;
};