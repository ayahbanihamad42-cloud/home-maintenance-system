 mobile/src/services/storeService.js

import api from "./api";

export const getStoresByService = async (service) => {
  const res = await api.get(`/stores?service=${service}`);
  return res.data;
};


