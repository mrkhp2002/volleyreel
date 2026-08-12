import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((config) => {
  try {
    // 1. කෙලින්ම 'token' හෝ 'access_token' කියලා සේව් වෙලා තියෙනවද කියලා බලනවා
    const rawToken = localStorage.getItem("token") || localStorage.getItem("access_token");

    // 2. නැත්නම් 'user' ඔබ්ජෙක්ට් එක ඇතුළේ තියෙනවද කියලා බලනවා
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userToken = user?.access_token || user?.token;

    // මේ ක්‍රම දෙකෙන් කොහෙන් හරි ටෝකන් එක හම්බවුණොත් ඒක ගන්නවා
    const token = rawToken || userToken;

    // ටෝකන් එකක් තියෙනවා නම් ඒක Header එකට දාලා යවනවා
    if (token) {
      // සමහර ටෝකන් වල අගට/මුලට කැරැක්ටර්ස් (") එකතු වෙලා තියෙන්න පුළුවන් නිසා ඒක සුද්ද කරනවා
      const cleanToken = token.replace(/^"|"$/g, ''); 
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
  } catch (err) {
    console.error("Token parse error:", err);
  }

  return config;
});

export default API;