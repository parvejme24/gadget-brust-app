import { Platform } from "react-native";

// In web browser preview, communicate directly with the local server
// On real mobile devices, fall back to EXPO_PUBLIC_API_URL (computer LAN IP)
const resolveApiUrl = () => {
  if (Platform.OS === "web" && typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host === "localhost" || host === "127.0.0.1") {
      return "http://localhost:6060/api";
    }
  }
  return process.env.EXPO_PUBLIC_API_URL || "http://localhost:6060/api";
};

export const API_URL = resolveApiUrl();
