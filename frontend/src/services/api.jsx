/*
 * Central place to configure API base URL
 * and attach Authorization token automatically.
 */

import axios from "axios";
import { getToken } from "./auth.service";

const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

API.interceptors.request.use(req => {
  const token = getToken();
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;
