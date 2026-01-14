// Import the configured Axios instance
import API from "./api";

// Send login request to the backend with user credentials
export const login = data =>
  API.post("/auth/login", data);

// Send register request to the backend with new user information
export const register = data =>
  API.post("/auth/register", data);


