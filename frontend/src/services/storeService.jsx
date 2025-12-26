/*
 Fetches nearby maintenance stores or companies.
 */

import API from "./api";

export const getStoresByService = async (service) => {
  const res = await API.get(`/stores?service=${service}`);
  return res.data;
};
