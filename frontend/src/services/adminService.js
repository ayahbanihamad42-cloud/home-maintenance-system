import axios from "./api";

export const getTechnicians = () => axios.get("/admin/technicians");

export const addTechnician = (data) => axios.post("/admin/technicians", data);
