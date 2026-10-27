// The live API by default; EXPO_PUBLIC_API_URL (in .env.local or the Vercel project) picks another one,
// e.g. http://<your computer's LAN IP>:6060/api to use a local server from a phone
const LIVE_API_URL = "https://gadgetbrust-server.vercel.app/api";

export const API_URL = process.env.EXPO_PUBLIC_API_URL || LIVE_API_URL;
