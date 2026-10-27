import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@/lib/api";
import { store } from "@/store";

// Delivery addresses: { id, label, name, phone, street, city, zipCode, note, isDefault, ...extra form fields }.
// Signed-in users keep them on their account (/api/addresses, shared with the website); guests on this device.
const KEY = "addressBook";

const CORE = ["label", "name", "phone", "street", "city", "zipCode", "note", "isDefault"];
const signedIn = () => !!store.getState().auth?.user;

// account address <-> the shape the screens use
const fromServer = (a) => ({ ...(a.details || {}), ...Object.fromEntries(CORE.map((k) => [k, a[k] ?? ""])), isDefault: !!a.isDefault, id: a._id });
const toServer = (a) => ({
  ...Object.fromEntries(CORE.filter((k) => a[k] !== undefined).map((k) => [k, a[k]])),
  details: Object.fromEntries(Object.entries(a).filter(([k, v]) => !CORE.includes(k) && k !== "id" && typeof v === "string" && v.trim())),
});
const listOf = (res) => {
  const data = res.data?.data;
  return (Array.isArray(data) ? data : data?.addresses || []).map(fromServer);
};

const remote = {
  list: () => api.get("/addresses").then(listOf).catch(() => []),
  save: (address) =>
    (address.id ? api.put(`/addresses/${address.id}`, toServer(address)) : api.post("/addresses", toServer(address))).then(listOf),
  remove: (id) => api.delete(`/addresses/${id}`).then(listOf),
  setDefault: (id) => api.patch(`/addresses/${id}/default`).then(listOf),
  // the server keeps one entry per street + city, so remembering is just a save
  remember: async (address) => {
    const list = await remote.list();
    if (list.some((a) => sameAddress(a, address))) return list;
    return remote.save({ ...address, label: list.length ? "Other" : "Home", isDefault: list.length === 0 });
  },
};

const read = async () => {
  try {
    return JSON.parse((await AsyncStorage.getItem(KEY)) || "[]");
  } catch {
    return [];
  }
};

const write = async (list) => {
  // exactly one default whenever there is at least one address
  const next = list.length && !list.some((a) => a.isDefault) ? list.map((a, i) => ({ ...a, isDefault: i === 0 })) : list;
  await AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  return next;
};

const sameAddress = (a, b) =>
  a.street.trim().toLowerCase() === b.street.trim().toLowerCase() && a.city.trim().toLowerCase() === b.city.trim().toLowerCase();

const device = {
  list: read,

  save: async (address) => {
    const list = await read();
    const id = address.id || `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
    const entry = { label: "Home", zipCode: "", ...address, id };
    let next = list.some((a) => a.id === id) ? list.map((a) => (a.id === id ? entry : a)) : [...list, entry];
    if (entry.isDefault) next = next.map((a) => ({ ...a, isDefault: a.id === id }));
    return write(next);
  },

  remove: async (id) => write((await read()).filter((a) => a.id !== id)),

  setDefault: async (id) => write((await read()).map((a) => ({ ...a, isDefault: a.id === id }))),

  // Called after checkout: remember a new address without duplicating an existing one
  remember: async (address) => {
    const list = await read();
    if (list.some((a) => sameAddress(a, address))) return list;
    return device.save({ ...address, label: list.length ? "Other" : "Home", isDefault: list.length === 0 });
  },
};

const source = () => (signedIn() ? remote : device);

export const addressBook = {
  list: () => source().list(),
  save: (address) => source().save(address),
  remove: (id) => source().remove(id),
  setDefault: (id) => source().setDefault(id),
  remember: (address) => source().remember(address),
};
