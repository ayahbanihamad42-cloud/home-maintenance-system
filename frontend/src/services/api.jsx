// Import axios library for making HTTP requests
import axios from "axios";

// Create a custom Axios instance with a base API URL
const API = axios.create({
  baseURL: "http://localhost:5000/api"
});

// Add a request interceptor
// This runs before every request is sent
API.interceptors.request.use(config => {
  // Get the authentication token from localStorage
  const token = localStorage.getItem("token");

  // If a token exists, attach it to the Authorization header
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Return the modified config to continue the request
  return config;
});

// Export the configured Axios instance
export default API;

