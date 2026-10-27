import api from "@/lib/api";
import { tokenStorage } from "@/lib/tokenStorage";
import { store } from "@/store";
import { signedIn, signedOut } from "@/store/slices/authSlice";

const errorText = (err, fallback) =>
  err.response?.data?.message ||
  (err.code === "ERR_NETWORK" ? "Unable to connect to backend server. Please check your network." : err.message) ||
  fallback;

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

  // the register endpoint returns the new user without tokens, so sign in right after
  register: async ({ name, email, password, phone }) => {
    try {
      // the API expects fullName
      await api.post("/register", { fullName: name, email, password, phone });
    } catch (err) {
      return { success: false, error: errorText(err, "Failed to register") };
    }
    return authService.login({ email, password });
  },

  // forgot password, step 1: emails a 6-digit code -> { success, emailSent, devCode? }
  // (devCode only comes back from a development server that can't send email)
  forgotPassword: async (email) => {
    try {
      const res = await api.post("/forgot-password", { email: email.trim().toLowerCase() });
      return { success: true, ...(res.data?.data || {}) };
    } catch (err) {
      return { success: false, error: errorText(err, "Couldn't send the reset code") };
    }
  },

  // step 2: set the new password; the server signs the user in
  resetPassword: async ({ email, code, newPassword }) => {
    try {
      const res = await api.post("/reset-password", { email: email.trim().toLowerCase(), code: code.trim(), newPassword });
      const { token, refreshToken, user } = res.data?.data || {};
      await tokenStorage.save({ token, refreshToken, user });
      store.dispatch(signedIn(user));
      return { success: true, user };
    } catch (err) {
      return { success: false, error: errorText(err, "Couldn't reset your password") };
    }
  },

  logout: async () => {
    try {
      // revokes the refresh token on the server
      const refreshToken = await tokenStorage.getRefreshToken();
      await api.post("/logout", { refreshToken }).catch(() => {});
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
