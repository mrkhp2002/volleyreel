import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const API = axios.create({
  baseURL: BASE_URL,
});

API.interceptors.request.use((config) => {
  try {
    // 1. Check for a bare token stored directly under "token" or "access_token"
    const rawToken =
      localStorage.getItem("token") || localStorage.getItem("access_token");

    // 2. Fall back to the "user" object that login stores
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const userToken = user?.access_token || user?.token;

    // Use whichever source has a token
    const token = rawToken || userToken;

    if (token) {
      // Strip any stray quotes that can appear when tokens are stored incorrectly
      const cleanToken = token.replace(/^"|"$/g, "");
      config.headers.Authorization = `Bearer ${cleanToken}`;
    }
  } catch (err) {
    console.error("Token parse error:", err);
  }

  // ── Trailing-slash fix ──────────────────────────────────────────────────────
  // FastAPI redirects /api/foo → /api/foo/ (307). Axios drops the Authorization
  // header on redirect, causing 401. Appending the slash here avoids the redirect
  // so the token is sent on the first (and only) request.
  if (config.url) {
    if (config.url.includes("?")) {
      const [path, query] = config.url.split("?");
      if (!path.endsWith("/")) {
        config.url = `${path}/?${query}`;
      }
    } else if (!config.url.endsWith("/")) {
      config.url = `${config.url}/`;
    }
  }

  return config;
});

export default API;