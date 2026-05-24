import API from "./api.jsx";

/* =========================
   PUBLIC TECHNICIAN APIs
========================= */

export const getTechnicians = async (service) => {
  const cleanService = encodeURIComponent(service || "");
  const res = await API.get(`/technicians/service/${cleanService}`);
  return Array.isArray(res.data) ? res.data : [];
};

export const smartSearchTechnicians = async (payload) => {
  const res = await API.post("/technicians/smart-search", payload);
  return res.data;
};

export const getTechnicianById = async (id) => {
  const res = await API.get(`/technicians/${id}`);
  return res.data;
};

export const getTechnicianAvailability = async (id, date) => {
  const query = date ? `?date=${encodeURIComponent(date)}` : "";
  const res = await API.get(`/technicians/${id}/availability${query}`);
  return Array.isArray(res.data) ? res.data : [];
};

export const getAvailability = async (id, date) => {
  return getTechnicianAvailability(id, date);
};

export const getTechnicianGallery = async (id) => {
  const res = await API.get(`/technicians/${id}/gallery`);
  return Array.isArray(res.data) ? res.data : [];
};

export const getTechnicianByUserId = async (userId) => {
  const res = await API.get(`/technicians/user/${userId}`);
  return res.data;
};

/* =========================
   TECHNICIAN PRIVATE APIs
========================= */

export const getMyTechnicianRequests = async () => {
  const res = await API.get("/technicians/requests/my");
  return Array.isArray(res.data) ? res.data : [];
};

export const updateTechnicianRequestStatus = async (requestId, status) => {
  const payload = typeof status === "string" ? { status } : status;
  const res = await API.put(`/technicians/requests/${requestId}/status`, payload);
  return res.data;
};

export const getMyAvailability = async () => {
  const res = await API.get("/technicians/availability/my");
  return Array.isArray(res.data) ? res.data : [];
};

export const createAvailability = async (payload) => {
  const res = await API.post("/technicians/availability", payload);
  return res.data;
};

export const deleteAvailability = async (id) => {
  const res = await API.delete(`/technicians/availability/${id}`);
  return res.data;
};

export const getMyRegularAvailability = async () => {
  const res = await API.get("/technicians/regular-availability/my");
  return Array.isArray(res.data) ? res.data : [];
};

export const createRegularAvailability = async (payload) => {
  const res = await API.post("/technicians/regular-availability", payload);
  return res.data;
};

export const deleteRegularAvailability = async (id) => {
  const res = await API.delete(`/technicians/regular-availability/${id}`);
  return res.data;
};

export const getMyTechnicianGallery = async () => {
  const res = await API.get("/technicians/gallery/my");
  return Array.isArray(res.data) ? res.data : [];
};

export const createTechnicianGalleryPost = async (payload) => {
  const res = await API.post("/technicians/gallery", payload);
  return res.data;
};

export const updateTechnicianGalleryPost = async (postId, payload) => {
  const res = await API.put(`/technicians/gallery/${postId}`, payload);
  return res.data;
};

export const deleteTechnicianGalleryPost = async (postId) => {
  const res = await API.delete(`/technicians/gallery/${postId}`);
  return res.data;
};

export const updateTechnicianPrice = async (payload) => {
  const res = await API.put("/technicians/price", payload);
  return res.data;
};