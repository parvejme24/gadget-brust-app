import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Session tokens live in the device keychain/keystore; the web preview falls back to localStorage.
const KEYS = { access: "accessToken", refresh: "refreshToken", user: "userData" };
const web = Platform.OS === "web";

const get = (key) => (web ? Promise.resolve(globalThis.localStorage?.getItem(key) ?? null) : SecureStore.getItemAsync(key));
const set = (key, value) => (web ? Promise.resolve(globalThis.localStorage?.setItem(key, value)) : SecureStore.setItemAsync(key, value));
const remove = (key) => (web ? Promise.resolve(globalThis.localStorage?.removeItem(key)) : SecureStore.deleteItemAsync(key));

export const tokenStorage = {
  getAccessToken: () => get(KEYS.access),
  getRefreshToken: () => get(KEYS.refresh),
  setAccessToken: (token) => set(KEYS.access, token),
  readUser: async () => {
    const [token, user] = await Promise.all([get(KEYS.access), get(KEYS.user)]);
    try {
      return token && user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },
  save: async ({ token, refreshToken, user }) => {
    await Promise.all([token && set(KEYS.access, token), refreshToken && set(KEYS.refresh, refreshToken), user && set(KEYS.user, JSON.stringify(user))]);
  },
  clear: () => Promise.all(Object.values(KEYS).map(remove)),
};
