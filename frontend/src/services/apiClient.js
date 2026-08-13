import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (user?.access_token) {
      config.headers.Authorization = `Bearer ${user.access_token}`;
    }
  } catch (err) {
    console.error("Token parse error:", err);
  }
  if (config.url && !config.url.endsWith("/") && !config.url.includes("?")) {
    config.url = config.url + "/";
  }
  return config;
});

export default API;