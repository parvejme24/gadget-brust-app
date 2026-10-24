import api from "@/lib/api";
import { tokenStorage } from "@/lib/tokenStorage";
import { store } from "@/store";
import { signedIn, signedOut } from "@/store/slices/authSlice";

export const authService = {
  login: async ({ email, password }) => {
    try {
      const res = await api.post("/login", { email, password });
      const { token, refreshToken, user } = res.data?.data || res.data || {};

      if (token && user) {
        await tokenStorage.save({ token, refreshToken, user });
        store.dispatch(signedIn(user));
        return { success: true, user };
      }
      throw new Error(res.data?.message || "Invalid login response");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK" ? "Unable to connect to backend server. Please check your network." : err.message) ||
        "Failed to sign in";
      return { success: false, error: message };
    }
  },

  register: async ({ name, email, password, phone }) => {
    try {
      const res = await api.post("/register", { name, email, password, phone });
      const { token, refreshToken, user } = res.data?.data || res.data || {};

      if (token && user) {
        await tokenStorage.save({ token, refreshToken, user });
        store.dispatch(signedIn(user));
        return { success: true, user };
      }
      throw new Error(res.data?.message || "Invalid registration response");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.code === "ERR_NETWORK" ? "Unable to connect to backend server. Please check your network." : err.message) ||
        "Failed to register";
      return { success: false, error: message };
    }
  },

  logout: async () => {
    try {
      await api.post("/logout").catch(() => {});
    } finally {
      await tokenStorage.clear();
      store.dispatch(signedOut());
    }
  },

  getProfile: async () => {
    const res = await api.get("/profile");
    return res.data?.data || res.data;
  },
};
