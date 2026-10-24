import AsyncStorage from "@react-native-async-storage/async-storage";

// Delivery addresses saved on this device: { id, label, name, phone, street, city, zipCode, isDefault }
const KEY = "addressBook";

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

export const addressBook = {
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
    return addressBook.save({ ...address, label: list.length ? "Other" : "Home", isDefault: list.length === 0 });
  },
};
