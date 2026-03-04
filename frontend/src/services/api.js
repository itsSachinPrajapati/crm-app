import axios from "axios";

const api = axios.create({
  const API = import.meta.env.VITE_API_URL;,
  withCredentials: true,
});

export default api;