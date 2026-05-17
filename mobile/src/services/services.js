import API from "./api";

const getServerBaseUrl = () => {
  const baseURL = API.defaults?.baseURL || "";
  return baseURL.replace(/\/api\/?$/, "");
};

export const getServices = async () => {
  const res = await API.get("/admin/services");
  return res.data || [];
};

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  if (imageUrl.startsWith("http")) return imageUrl;

  return `${getServerBaseUrl()}${imageUrl}`;
};