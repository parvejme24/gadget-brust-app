import AsyncStorage from "@react-native-async-storage/async-storage";

// Orders placed on this device, so guests can track them without retyping the number and phone
const KEY = "recentOrders";
const MAX = 20;

export const recentOrders = {
  list: async () => {
    try {
      return JSON.parse((await AsyncStorage.getItem(KEY)) || "[]");
    } catch {
      return [];
    }
  },
  add: async (order) => {
    const list = await recentOrders.list();
    const next = [order, ...list.filter((o) => o.number !== order.number)].slice(0, MAX);
    await AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
    return next;
  },
  find: async (number) => (await recentOrders.list()).find((o) => o.number === number) || null,
};

// Last checkout contact + address, prefilled next time
const CONTACT_KEY = "checkoutContact";
export const savedContact = {
  read: async () => {
    try {
      return JSON.parse((await AsyncStorage.getItem(CONTACT_KEY)) || "null");
    } catch {
      return null;
    }
  },
  save: (contact) => AsyncStorage.setItem(CONTACT_KEY, JSON.stringify(contact)).catch(() => {}),
};
