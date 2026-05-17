import API from "./api";

export const getServices = async () => {
  const res = await API.get("/admin/services");
  return res.data || [];
};

export const createService = async (serviceData) => {
  const res = await API.post("/admin/services", serviceData);
  return res.data;
};

export const deleteService = async (serviceId) => {
  const res = await API.delete(`/admin/services/${serviceId}`);
  return res.data;
};

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return "";

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `http://localhost:5000${imageUrl}`;
};