import axios from "axios";

const api = axios.create({
  baseURL: "https://crm-app-6mpo.onrender.com/api",
  withCredentials: true,
});

export default api;