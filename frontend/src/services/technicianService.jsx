import api from "../services/api";

export const getTechnicians = async (service) => {
  const res = await api.get(`/technicians/service/${service}`);
  return res.data;
};

export const getAvailability = async (techId, date) => {
  const res = await api.get(`/technicians/${techId}/availability`, {
    params: { date },
  });
  return res.data;
};

export const getTechnicianProfile = async (technicianId) => {
  const res = await api.get(`/technicians/${technicianId}`);
  return res.data;
};

export const getTechnicianByUserId = async (userId) => {
  const res = await api.get(`/technicians/user/${userId}`);
  return res.data;
};

export const updateTechnicianPrice = async (price_per_hour) => {
  const res = await api.put(`/technicians/price`, { price_per_hour });
  return res.data;
};

export const getTechnicianGallery = async (technicianId) => {
  const res = await api.get(`/technicians/${technicianId}/gallery`);
  return res.data;
};

export const getMyTechnicianGallery = async () => {
  const res = await api.get(`/technicians/gallery/my`);
  return res.data;
};

export const createTechnicianGalleryPost = async ({ description, images }) => {
  const res = await api.post(`/technicians/gallery`, { description, images });
  return res.data;
};

export const deleteTechnicianGalleryPost = async (postId) => {
  const res = await api.delete(`/technicians/gallery/${postId}`);
  return res.data;
};