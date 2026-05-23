import API from "./api";

export const getTechnicians = async (service) => {
  const safeService = encodeURIComponent(String(service || "").trim());
  const res = await API.get(`/technicians/service/${safeService}`);
  return res.data;
};

export const smartSearchTechnicians = async ({ searchText, service, userCity }) => {
  const res = await API.post("/technicians/smart-search", {
    searchText,
    service,
    userCity,
  });

  return res.data;
};

export const getAvailability = async (techId, date) => {
  const res = await API.get(`/technicians/${techId}/availability`, {
    params: { date },
  });
  return res.data;
};

export const getTechnicianProfile = async (technicianId) => {
  const res = await API.get(`/technicians/${technicianId}`);
  return res.data;
};

export const getTechnicianById = async (technicianId) => {
  const res = await API.get(`/technicians/${technicianId}`);
  return res.data;
};

export const getTechnicianByUserId = async (userId) => {
  const res = await API.get(`/technicians/user/${userId}`);
  return res.data;
};

export const updateTechnicianPrice = async (price_per_hour) => {
  const res = await API.put("/technicians/price", { price_per_hour });
  return res.data;
};

export const getTechnicianGallery = async (technicianId) => {
  const res = await API.get(`/technicians/${technicianId}/gallery`);
  return res.data;
};

export const getMyTechnicianGallery = async () => {
  const res = await API.get("/technicians/gallery/my");
  return res.data;
};

export const createTechnicianGalleryPost = async (data) => {
  const res = await API.post("/technicians/gallery", data);
  return res.data;
};

export const updateTechnicianGalleryPost = async (postId, data) => {
  const res = await API.put(`/technicians/gallery/${postId}`, data);
  return res.data;
};

export const deleteTechnicianGalleryPost = async (postId) => {
  const res = await API.delete(`/technicians/gallery/${postId}`);
  return res.data;
};

export const getMyTechnicianRequests = async () => {
  const res = await API.get("/technicians/requests/my");
  return res.data;
};

export const updateTechnicianRequestStatus = async (requestId, status) => {
  const res = await API.put(`/technicians/requests/${requestId}/status`, {
    status,
  });
  return res.data;
};

export const getMyRegularAvailability = async () => {
  const res = await API.get("/technicians/regular-availability/my");
  return res.data;
};

export const createRegularAvailability = async (data) => {
  const res = await API.post("/technicians/regular-availability", data);
  return res.data;
};

export const deleteRegularAvailability = async (id) => {
  const res = await API.delete(`/technicians/regular-availability/${id}`);
  return res.data;
};