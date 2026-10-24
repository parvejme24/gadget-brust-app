import axios, { create } from "axios";
import { API_URL } from "./config";
import { tokenStorage } from "./tokenStorage";

// one axios client for the whole app (same API as the web client)
const api = create({ baseURL: API_URL, timeout: 20000, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use(async (config) => {
  const token = await tokenStorage.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// refresh the 1-hour access token once, then retry
let refreshPromise = null;
let onSessionExpired = () => {};
export const setSessionExpiredHandler = (fn) => {
  onSessionExpired = fn;
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    const refreshToken = await tokenStorage.getRefreshToken();
    if (error.response?.status === 401 && refreshToken && !original._retry && !original.url?.includes("/refresh")) {
      original._retry = true;
      try {
        refreshPromise ||= axios.post(`${API_URL}/refresh`, { refreshToken }).finally(() => {
          refreshPromise = null;
        });
        const response = await refreshPromise;
        const accessToken = response.data?.data?.token;
        await tokenStorage.setAccessToken(accessToken);
        original.headers.Authorization = `Bearer ${accessToken}`;
        return api(original);
      } catch {
        await tokenStorage.clear();
        onSessionExpired();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
