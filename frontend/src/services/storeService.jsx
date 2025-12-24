import axios from "axios";

export const getStoreServices = async (service) => {
  try {
    const res = await axios.get(`/api/stores?service=${service}`);
    return res.data; 
  } catch (err) {
    console.error(err);
    return [];
  }
};
